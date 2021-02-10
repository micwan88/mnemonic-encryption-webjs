(() => {
	let salt;
	let ciphertext;
	let iv;

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
			encoder.encode(passphrase),
			"PBKDF2",
			false,
			["deriveKey"]
		);
	}

	function deriveAESKey() {
		
	}

	async function encrypt() {
		if (!validation("Encryption", ".encrypt-section"))
			return;

		let masterKey = await deriveMasterKey(".encrypt-section");

		console.log(masterKey);

		clearFormData("Encryption", ".encrypt-section");

		alert("Encryption completed.");
	}

	async function decrypt() {
		if (!validation("Decryption", ".decrypt-section"))
			return;

		clearFormData("Decryption", ".encrypt-section");

		alert("Decryption completed.");
	}

	const encryptButton = document.querySelector("#encryptBtn");
	encryptButton.addEventListener("click", encrypt);

	const decryptButton = document.querySelector("#decryptBtn");
	decryptButton.addEventListener("click", decrypt);
})();