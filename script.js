const leftImageBox = document.querySelector(".left-image-box");
const rightImageBox = document.querySelector(".right-image-box");
const streakText = document.querySelector(".streak");
const leftImage = document.querySelector(".left-image");
const rightImage = document.querySelector(".right-image");
const nextButton = document.querySelector(".next");
const startButton = document.querySelector(".start");

nextButton.disabled = true;
leftImage.style.display = "none";
rightImage.style.display = "none";
let currentStreak = 0;

let turn = false;

let leftIsAI = false;
let rightIsAI = false;

const getRandomBox = () => {
	let random = Math.random();
	let randomBox = Math.floor(random * 2);
	let boxList = [leftImageBox, rightImageBox];
	return boxList[randomBox];
}

const getRealImage = async () => {
	let response = await fetch('https://picsum.photos/1000');

	return response.url;
}

const getRealImageDescription = async (image) => {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
		{
			headers: {
				Authorization: "Bearer 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",
				"Content-Type": "application/json"
			},
			method: "POST",
			body: image,
		}
	);
	const result = await response.json();
	return result;
}

async function descriptionToImage(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
		{
			headers: {
				Authorization: "Bearer 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",
				"Content-Type": "application/json"
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();

	return result;
}

startButton.addEventListener("click", () => {
	startButton.style.opacity = 0;
	startButton.disabled = true;
	nextButton.disabled = false;
	leftImage.style.display = "block";
	rightImage.style.display = "block";
	doOperation();
});

async function doOperation() {
	leftImage.src = 'loading.gif'
	rightImage.src = 'loading.gif'
	leftImage.classList.add("loading");
	rightImage.classList.add("loading");
	leftImage.style.filter = "none";
	rightImage.style.filter = "none";
	leftIsAI = false;
	rightIsAI = false;
	nextButton.disabled = true;
	getRealImage().then(async (realImage) => {
		let randomBox = getRandomBox();
		getRealImageDescription(realImage).then(async (imageDesc) => {
			descriptionToImage({ "inputs": imageDesc[0].generated_text }).then(async (blob) => {
				let base64 = await toBase64(blob);
				leftImage.classList.remove("loading")
				rightImage.classList.remove("loading")
				randomBox.childNodes[1].src = realImage;
				if (leftImage.src.substring(leftImage.src.length - 4, leftImage.src.length) != '.gif') {
					rightImage.src = base64;
					rightIsAI = true;
				} else {
					leftImage.src = base64;
					leftIsAI = true;
				}
				nextButton.disabled = false;
			});
		});
	});
}

async function toBase64(blobURL) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = function () {
			const base64 = reader.result;
			resolve(base64);
		};
		reader.onerror = function (error) {
			reject(error);
		};
		reader.readAsDataURL(blobURL);
	});
}

nextButton.addEventListener('click', () => {
	nextButton.disabled = true;
	turn = false; 
	doOperation();
});

leftImage.addEventListener("click", () => {
	if (turn == false) {
		if (leftIsAI == false) {
			//correct answer
			leftImage.style.filter = "sepia()";
			rightImage.style.filter = "grayscale()";
			streakText.innerHTML = "Your Streak: " + (currentStreak += 1);
			nextButton.disabled = false;
			turn = true;
		} else {
			leftImage.style.filter = "grayscale()";
			rightImage.style.filter = "sepia()";
			streakText.innerHTML = "Your Streak: " + (currentStreak = 0);
		}
	}

});

rightImage.addEventListener("click", () => {
	if (turn == false) {
		if (rightIsAI == false) {
			//correct answer
			rightImage.style.filter = "sepia()";
			leftImage.style.filter = "grayscale()";
			streakText.innerHTML = "Your Streak: " + (currentStreak += 1);
			nextButton.disabled = false;
			turn = true;
		} else {
			rightImage.style.filter = "grayscale()";
			leftImage.style.filter = "sepia()";
			streakText.innerHTML = "Your Streak: " + (currentStreak = 0);
		}
	}

});

