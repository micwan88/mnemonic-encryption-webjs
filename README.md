# Welcome to Mnemonic Encryption/Decryption Tool

<img src="/demo/demo-screen.png?raw=true" width="500px"/>

Mnemonic words are hard to remember and it is unsafe to put it in online storage like iCloud/Dropbox. To solve this, we can encrypt the mnemonic words with memorable passphrase, then it's more safe to store the result ciphertext in the online storage.

The encryption/decryption is done by WebCrypto API with AES-GCM-256 and you can refer to [Mozilla Developer Site](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) for more detail about that API.

This tool is a standalone webpage. Everyone can download it to local machine and then execute it safely or trying the live demo in below link directly.

## Live Demo
[mnemonic-encryption-webjs](https://micwan88.github.io/mnemonic-encryption-webjs/).