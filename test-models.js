const API_KEY = "AIzaSyBW1FDFwCGCR65TsLIAtW_QEOfJ0zQnGPU";
const MODELS = [
  "gemini-pro",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-1.0-pro-latest",
  "gemini-ultra"
];

async function checkModels() {
  console.log("Checking Gemini models...");
  for (const model of MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${API_KEY}`
      );
      console.log(`Model: ${model}, Status: ${response.status}`);
      if (response.status === 200) {
        const data = await response.json();
        console.log(`  Name: ${data.name}`);
      } else {
        const error = await response.json();
        console.log(`  Error: ${JSON.stringify(error)}`);
      }
    } catch (e) {
      console.log(`  Fetch error: ${e.message}`);
    }
  }
}

checkModels();
