async function generateExcuse() {
    const problemInput = document.querySelector("input").value.trim();
    const tone = document.getElementById("tone-selector").value; // Get selected tone
    const excuseOutput = document.getElementById("excuseOutput");
    const button = document.querySelector("button");
    const buttonText = button.innerHTML; // Save button text

    if (!problemInput) {
        excuseOutput.textContent = "Please enter a problem first!";
        excuseOutput.style.color = "#6366f1";
        excuseOutput.classList.add("show");
        return;
    }

    try {
        console.log("Sending request...");

        // Add loading effect to button
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        button.disabled = true;

        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problem: problemInput, tone }) // Send problem & tone
        });

        console.log("Response received:", response.status);

        if (!response.ok) {
            console.log("Error: Response not OK");
            throw new Error(`Error! Status: ${response.status}`);
        }

        const data = await response.json();
        excuseOutput.innerHTML = ""; // Clear previous text
        excuseOutput.style.color = "#4b5563";
        excuseOutput.classList.add("show");

        // Typing animation (character by character)
        let i = 0;
        function typeEffect() {
            if (i < data.excuse.length) {
                excuseOutput.innerHTML += data.excuse.charAt(i);
                i++;
                setTimeout(typeEffect, 50); // Adjust typing speed (50ms per char)
            }
        }
        typeEffect();

    } catch (error) {
        excuseOutput.textContent = "Error fetching excuse. Please try again!";
        excuseOutput.style.color = "#ef4444";
        excuseOutput.classList.add("show");
        console.error("Fetch error:", error);
    } finally {
        // Restore button text
        button.innerHTML = buttonText;
        button.disabled = false;
    }
}

// Event listener for the Generate button
document.querySelector("button").addEventListener("click", generateExcuse);

// Copy excuse to clipboard
document.getElementById("copyExcuse").addEventListener("click", () => {
    const excuseText = document.getElementById("excuseOutput").textContent.trim();

    if (!excuseText) {
        alert("No excuse generated yet!");
        return;
    }

    navigator.clipboard.writeText(excuseText)
        .then(() => {
            // Create and show a temporary tooltip
            const tooltip = document.createElement("div");
            tooltip.textContent = "Copied!";
            tooltip.style.position = "fixed";
            tooltip.style.left = "50%";
            tooltip.style.bottom = "20px";
            tooltip.style.transform = "translateX(-50%)";
            tooltip.style.padding = "10px 20px";
            tooltip.style.background = "#10b981";
            tooltip.style.color = "white";
            tooltip.style.borderRadius = "8px";
            tooltip.style.zIndex = "1000";
            tooltip.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            document.body.appendChild(tooltip);
            
            // Remove the tooltip after 2 seconds
            setTimeout(() => {
                document.body.removeChild(tooltip);
            }, 2000);
        })
        .catch(err => console.error("Failed to copy:", err));
});

// Tweet the excuse
document.getElementById("tweetExcuse").addEventListener("click", () => {
    const excuseText = document.getElementById("excuseOutput").textContent.trim();

    if (!excuseText) {
        alert("No excuse generated yet!");
        return;
    }

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(excuseText)}`;
    window.open(tweetUrl, "_blank");
});

// Add input animation
const input = document.querySelector("input");
if (input) {
    input.addEventListener("focus", () => {
        input.style.transform = "scale(1.02)";
    });
    input.addEventListener("blur", () => {
        input.style.transform = "scale(1)";
    });
}