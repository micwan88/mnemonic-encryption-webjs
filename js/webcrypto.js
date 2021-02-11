(() => {
	const aesKeySize = 256;
	const keyGenIterationcount = 1000000;
	const deriveKeyAlgo = "PBKDF2";
	const deriveKeyHash = "SHA-256";
	const deriveKeySaltSizeInByte = 16;
	const aesGcmIvSizeInByte = 12;
	const aesGcmTagLengthInBits = 128;

	function base64ToArrayBuffer(base64String) {
		let binaryString = atob(base64String);
		let returnByteArray = new Uint8Array(binaryString.length);
		for (var i = 0; i < binaryString.length; i++) {
			returnByteArray[i] = binaryString.charCodeAt(i);
		}
		return returnByteArray.buffer;
	}

	function validation(formName, formClass) {
		let passphrase = document.querySelector(formClass + " .passphrase").value;
		if (passphrase.trim() == "") {
			alert(formName + " passphrase cannot be empty !");
			return false;
		}

		let confirmpass = document.querySelector(formClass + " .confirmpass").value;
		if (confirmpass != passphrase) {
			alert(formName + " confirmpass not match with passphrase !");
			return false;
		}

		let targetText = document.querySelector(formClass + " .target-text").value;
		if (targetText.trim() == "") {
			if (formName == "Encryption")
				alert(formName + " mnemonic cannot be empty !");
			else
				alert(formName + " ciphertext cannot be empty !");
			return false;
		}

		return true;
	}

	//Clear form data after encrypt/decrypt
	function clearFormData(formName, formClass) {
		document.querySelector(formClass + " .passphrase").value = "";
		document.querySelector(formClass + " .confirmpass").value = "";
		document.querySelector(formClass + " .target-text").value = "";
	}

	function deriveMasterKey(formClass) {
		let passphrase = document.querySelector(formClass + " .passphrase").value;
		let encoder = new TextEncoder();
		return window.crypto.subtle.importKey(
			"raw",
			encoder.encode(passphrase.trim()),
			deriveKeyAlgo,
			false,
			["deriveKey"]
		);
	}

	function deriveAESKey(masterKey, keySalt) {
		return window.crypto.subtle.deriveKey(
			{
				"name": deriveKeyAlgo,
				salt: keySalt,
				"iterations": keyGenIterationcount,
				"hash": deriveKeyHash
			},
			masterKey,
			{ "name": "AES-GCM", "length": aesKeySize}, //AES-256
			false,
			[ "encrypt", "decrypt" ]
		);
	}

	function combineIvKeySaltCipher(keySalt, iv, cipherText) {
		let combinedUint8Array = new Uint8Array(deriveKeySaltSizeInByte + aesGcmIvSizeInByte + cipherText.byteLength);
		combinedUint8Array.set(keySalt);
		combinedUint8Array.set(iv, deriveKeySaltSizeInByte);
		combinedUint8Array.set(new Uint8Array(cipherText), deriveKeySaltSizeInByte + aesGcmIvSizeInByte);

		return combinedUint8Array;
	}

	async function encrypt() {
		document.querySelector(".encrypt-section .result-text").textContent = "Ciphertext result here";

		if (!validation("Encryption", ".encrypt-section"))
			return;

		let encoder = new TextEncoder();
		let masterKey = await deriveMasterKey(".encrypt-section");
		//16 bytes for salt and need to save it for decryption
		let keySalt = window.crypto.getRandomValues(new Uint8Array(deriveKeySaltSizeInByte));
		let aesKey = await deriveAESKey(masterKey, keySalt);
		//12 bytes (96bits) for iv - AES-GCM mode
		let iv = window.crypto.getRandomValues(new Uint8Array(aesGcmIvSizeInByte));
		let targetText = document.querySelector(".encrypt-section .target-text").value;
		let cipherText = await window.crypto.subtle.encrypt(
			{
				name: "AES-GCM",
				iv: iv,
				tagLength: aesGcmTagLengthInBits
			},
			aesKey,
			encoder.encode(targetText.trim())
		);

		//Debug usage
		console.log(keySalt);
		console.log(iv);
		console.log(cipherText);
		//console.log(cipherText.byteLength);

		let combinedUint8Array = combineIvKeySaltCipher(keySalt, iv, cipherText);

		console.log(combinedUint8Array);
		console.log(combinedUint8Array.byteLength);

		let base64EncodedResult = btoa(combinedUint8Array);

		//console.log(base64EncodedResult);

		document.querySelector(".encrypt-section .result-text").textContent = base64EncodedResult;

		clearFormData("Encryption", ".encrypt-section");

		alert("Encryption completed.");
	}

	async function decrypt() {
		document.querySelector(".decrypt-section .result-text").textContent = "Mnemonic words result here";

		if (!validation("Decryption", ".decrypt-section"))
			return;

		let targetText = document.querySelector(".decrypt-section .target-text").value;

		console.log(targetText);

		let masterKey = await deriveMasterKey(".decrypt-section");
		let combinedUint8Array = base64ToArrayBuffer(targetText);

		console.log(combinedUint8Array);

		//16 bytes for salt
		let keySalt = new Uint8Array(combinedUint8Array, 0, deriveKeySaltSizeInByte);
		//12 bytes (96bits) for iv - AES-GCM mode
		let iv = new Uint8Array(combinedUint8Array, deriveKeySaltSizeInByte, aesGcmIvSizeInByte);
		let cipherText = new Uint8Array(combinedUint8Array, deriveKeySaltSizeInByte + aesGcmIvSizeInByte, combinedUint8Array.length - deriveKeySaltSizeInByte - aesGcmIvSizeInByte);

		console.log(keySalt);
		console.log(iv);
		console.log(cipherText);

		let aesKey = await deriveAESKey(masterKey, keySalt);

		clearFormData("Decryption", ".decrypt-section");

		alert("Decryption completed.");
	}

	const encryptButton = document.querySelector("#encryptBtn");
	encryptButton.addEventListener("click", encrypt);

	const decryptButton = document.querySelector("#decryptBtn");
	decryptButton.addEventListener("click", decrypt);
})();