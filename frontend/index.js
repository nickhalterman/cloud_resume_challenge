// Lambda / API trigger for visitor counter
const counter = document.querySelector(".counter");

async function updateCounter() {
  try {
    const response = await fetch("https://hjjppjspzvuuwm7pilukouqrvu0vppar.lambda-url.us-east-1.on.aws/");
    const data = await response.json();

    const views = data.views;

    counter.innerText = `Views: ${data}`;
  } catch (error) {
    console.error('Error updating counter:', error);
    counter.innerText = "Couldn't read views";
  }
}


updateCounter();

