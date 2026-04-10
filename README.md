# Som do Mato — Web Radio

Player de web rádio construído com [Tauri v2](https://tauri.app), React e TypeScript.

---

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Desenvolvimento local](#desenvolvimento-local)
- [Build de produção (desktop)](#build-de-produção-desktop)
- [Build mobile](#build-mobile)
  - [Android](#android)
  - [iOS](#ios)
- [Publicar na Google Play Store](#publicar-na-google-play-store)
- [Publicar na Apple App Store](#publicar-na-apple-app-store)

---

## Pré-requisitos

### Todos os ambientes

- [Node.js](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io) >= 9
- [Rust](https://rustup.rs) (stable) + `cargo`

```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Instalar pnpm
npm install -g pnpm
```

### Android

- [Android Studio](https://developer.android.com/studio) (inclui Android SDK e NDK)
- Java JDK 17+
- Variáveis de ambiente configuradas:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export ANDROID_HOME=$HOME/Android/Sdk
export NDK_HOME=$ANDROID_HOME/ndk/$(ls $ANDROID_HOME/ndk)
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

- Targets Rust para Android:

```bash
rustup target add \
  aarch64-linux-android \
  armv7-linux-androideabi \
  i686-linux-android \
  x86_64-linux-android
```

### iOS (apenas macOS)

- Xcode 15+ (disponível na Mac App Store)
- Xcode Command Line Tools: `xcode-select --install`
- Conta Apple Developer ($99/ano) para distribuição
- Target Rust para iOS:

```bash
rustup target add \
  aarch64-apple-ios \
  x86_64-apple-ios \
  aarch64-apple-ios-sim
```

---

## Desenvolvimento local

```bash
# Instalar dependências
pnpm install

# Rodar em modo dev (desktop)
pnpm tauri dev

# Rodar em modo dev (Android) — emulador ou dispositivo físico conectado
pnpm tauri android dev

# Rodar em modo dev (iOS) — apenas macOS
pnpm tauri ios dev
```

> **Arch Linux / Hyprland:** a variável `WEBKIT_DISABLE_DMABUF_RENDERER=1` já está configurada
> no script `tauri` do `package.json` para evitar tela cinza no WebKitGTK.

---

## Build de produção (desktop)

```bash
pnpm tauri build
```

Os artefatos gerados ficam em `src-tauri/target/release/bundle/`:

| Sistema | Formato |
|---------|---------|
| Linux | `.deb`, `.rpm`, `AppImage` |
| Windows | `.msi`, `.exe` (NSIS) |
| macOS | `.dmg`, `.app` |

---

## Build mobile

### Android

#### 1. Inicializar o projeto Android (apenas na primeira vez)

```bash
pnpm tauri android init
```

Isso gera a pasta `src-tauri/gen/android/`.

#### 2. Build de debug

```bash
pnpm tauri android build --debug
```

APK gerado em:
```
src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

#### 3. Build de release (assinado)

Crie um keystore (apenas uma vez — guarde o arquivo com segurança):

```bash
keytool -genkey -v \
  -keystore somdomato.keystore \
  -alias somdomato \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Configure a assinatura em `src-tauri/gen/android/app/build.gradle.kts`:

```kotlin
android {
    signingConfigs {
        create("release") {
            storeFile = file("../../../somdomato.keystore")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = "somdomato"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

Build do AAB (formato exigido pela Play Store):

```bash
KEYSTORE_PASSWORD=sua_senha KEY_PASSWORD=sua_senha \
  pnpm tauri android build --aab
```

AAB gerado em:
```
src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab
```

---

### iOS

#### 1. Inicializar o projeto iOS (apenas na primeira vez)

```bash
pnpm tauri ios init
```

Isso gera a pasta `src-tauri/gen/apple/`.

#### 2. Abrir no Xcode

```bash
pnpm tauri ios xcode
```

No Xcode:
- Selecione o target `somdomato`
- Em **Signing & Capabilities**, selecione seu Apple Developer Team
- Confira o Bundle Identifier: `com.somdomato.app`

#### 3. Build de release

```bash
pnpm tauri ios build
```

O `.ipa` é gerado via Xcode Archive. Para gerar o arquivo diretamente pela linha de comando:

```bash
pnpm tauri ios build --release
```

---

## Publicar na Google Play Store

### Pré-requisitos

- Conta no [Google Play Console](https://play.google.com/console) ($25 taxa única)
- AAB assinado (ver seção [Android — Build de release](#3-build-de-release-assinado))

### Passo a passo

1. **Criar o app no Play Console**
   - Acesse Play Console → *Todos os apps* → *Criar app*
   - Preencha nome, idioma padrão e categoria

2. **Configurar ficha da loja**
   - Descrição curta (80 caracteres) e descrição completa
   - Screenshots: mínimo 2 por tipo de dispositivo (celular, tablet)
   - Ícone de alta resolução: 512×512 px PNG
   - Imagem de capa: 1024×500 px

3. **Definir classificação etária**
   - Acesse *Classificação de conteúdo* e preencha o questionário

4. **Configurar preço e distribuição**
   - Defina se o app é gratuito ou pago
   - Selecione os países de distribuição

5. **Fazer upload do AAB**
   - Acesse *Produção* → *Criar nova versão*
   - Faça upload do `.aab` gerado
   - Preencha as notas de versão

6. **Enviar para revisão**
   - Clique em *Revisar versão* → *Enviar para produção*
   - A revisão costuma levar de algumas horas a 3 dias úteis

---

## Publicar na Apple App Store

### Pré-requisitos

- Conta no [Apple Developer Program](https://developer.apple.com/programs/) ($99/ano)
- Mac com Xcode 15+
- `.ipa` assinado com certificado de distribuição

### Passo a passo

#### 1. Configurar certificados e perfis no Xcode

1. Abra Xcode → *Settings* → *Accounts* → adicione seu Apple ID
2. Selecione o time e clique em *Manage Certificates*
3. Crie um certificado **Apple Distribution**
4. No [Apple Developer Portal](https://developer.apple.com/account), crie:
   - Um **App ID** com Bundle ID `com.somdomato.app`
   - Um **Provisioning Profile** do tipo *App Store Distribution*

#### 2. Criar o app no App Store Connect

1. Acesse [App Store Connect](https://appstoreconnect.apple.com)
2. *Apps* → *+* → *New App*
3. Preencha:
   - Nome: Som do Mato
   - Bundle ID: `com.somdomato.app`
   - SKU: `somdomato-001`
   - Idioma principal: Português (Brasil)

#### 3. Preencher metadados

- Descrição, palavras-chave, URL de suporte
- Screenshots obrigatórias por tamanho de tela (6,7", 6,5", 5,5" e iPad se aplicável)
- Ícone do app: 1024×1024 px PNG sem transparência
- Classificação etária: preencha o questionário

#### 4. Gerar o arquivo para upload

No Xcode:
1. Selecione o scheme **Release** e destino **Any iOS Device**
2. *Product* → *Archive*
3. Na janela *Organizer*, clique em *Distribute App*
4. Selecione *App Store Connect* → *Upload*
5. Aguarde o processamento (pode levar até 30 minutos)

Alternativa via linha de comando com `xcrun altool`:

```bash
xcrun altool --upload-app \
  --type ios \
  --file caminho/para/somdomato.ipa \
  --username "seu@apple.id" \
  --password "@keychain:AC_PASSWORD"
```

#### 5. Submeter para revisão

1. No App Store Connect, selecione o build que apareceu após o upload
2. Preencha informações de conformidade de exportação
3. Clique em *Add for Review* → *Submit to App Review*
4. A revisão costuma levar de 24 a 48 horas

---

## Estrutura do projeto

```
mobile/
├── src/                    # Frontend React
│   ├── App.tsx             # Componente principal (player)
│   └── App.css             # Estilos
├── src-tauri/
│   ├── src/
│   │   ├── main.rs         # Entrypoint Rust
│   │   └── lib.rs          # Comandos Tauri
│   ├── capabilities/
│   │   └── default.json    # Permissões da janela
│   ├── Cargo.toml          # Dependências Rust
│   └── tauri.conf.json     # Configuração do app
├── public/
│   └── logo.svg
└── package.json
```

---

## Variáveis de ambiente relevantes

| Variável | Descrição |
|----------|-----------|
| `WEBKIT_DISABLE_DMABUF_RENDERER` | Desabilita DMA-BUF no WebKitGTK (necessário no Hyprland) |
| `GDK_BACKEND` | Força backend X11 no GTK (`x11`) |
| `KEYSTORE_PASSWORD` | Senha do keystore Android |
| `KEY_PASSWORD` | Senha da chave Android |
| `ANDROID_HOME` | Caminho para o Android SDK |
| `NDK_HOME` | Caminho para o Android NDK |
