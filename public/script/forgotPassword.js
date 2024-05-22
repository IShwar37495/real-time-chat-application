const inputElement = document.getElementById("email");
const buttonElement = document.getElementById("forgot-password-btn");
const otpSubmitButton = document.getElementById("otp-button");
const otpDiv = document.getElementById("otp");
const errorElement = document.getElementById("error-element");
const buttonText = document.getElementById("button-text");
const loadingIcon = document.getElementById("loading-icon");
const otpButtonText = document.getElementById("otp-button-text");
const otpLoadingIcon = document.getElementById("otp-loading-icon");

async function submitData(e) {
  e.preventDefault();
  toggleLoading(buttonElement, buttonText, loadingIcon, true);
  const email = inputElement.value;

  try {
    const response = await axios.post("http://localhost:5000/forgotPassword", {
      email,
    });
    if (!response) {
      console.log("error response");
    }

    if (response.status === 201) {
      otpDiv.style.display = "block";
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    toggleLoading(buttonElement, buttonText, loadingIcon, false);
  }
}

async function verifyOtp(e) {
  e.preventDefault();

  const otpInputs = document.getElementsByClassName("otp-input");
  let otp = "";

  for (let input of otpInputs) {
    otp += input.value;
  }

  try {
    const response = await axios.post("http://localhost:5000/verifyOtp", {
      email: inputElement.value,
      otp,
    });

    if (response.status === 200) {
      errorElement.style.display = "block";
      errorElement.classList.remove("warning");
      errorElement.classList.add("success");
      errorElement.innerText = response.data.message;
      const email = inputElement.value;

      setTimeout(() => {
        // window.location.href = response.data.redirectUrl;
        window.location.href = `http://localhost:5000/newPassword?email=${encodeURIComponent(
          email
        )}`;
      }, 1000);
    }
  } catch (error) {
    errorElement.style.display = "block";
    errorElement.classList.remove("success");
    errorElement.classList.add("warning");
    errorElement.innerText = error.response
      ? error.response.data.message
      : "An error occurred";
  }
}

function setupOtpInputs() {
  const otpInputs = document.getElementsByClassName("otp-input");

  for (let i = 0; i < otpInputs.length; i++) {
    otpInputs[i].addEventListener("input", function () {
      if (this.value.length === this.maxLength) {
        if (i + 1 < otpInputs.length) {
          otpInputs[i + 1].focus();
        }
      }
    });
  }
}

function toggleLoading(button, buttonText, loadingIcon, isLoading) {
  if (isLoading) {
    button.classList.add("loading");
    buttonText.style.display = "none";
    loadingIcon.style.display = "inline-block";
  } else {
    button.classList.remove("loading");
    buttonText.style.display = "inline-block";
    loadingIcon.style.display = "none";
  }
}

buttonElement.addEventListener("click", submitData);
otpSubmitButton.addEventListener("click", verifyOtp);
setupOtpInputs();

//new password
