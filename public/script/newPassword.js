const submitbuttonElement = document.getElementById("submit");
const newPassword = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const errorOrSuccess = document.getElementById("error-or-success");

const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");

async function submitDataForPassword(e) {
  e.preventDefault();
  data = {
    password: newPassword.value,
    confirmPassword: confirmPassword.value,
    email: email,
  };
  try {
    const response = await axios.post(
      "http://localhost:5000/newPassword",
      data
    );

    if (response.status === 200) {
      errorOrSuccess.style.display = "block";
      errorOrSuccess.classList.remove("warning");
      errorOrSuccess.classList.add("success");
      errorOrSuccess.innerText = response.data.message;

      setTimeout(() => {
        window.location.href = response.data.redirectUrl;
      }, 1000);
    }
  } catch (error) {
    errorOrSuccess.style.display = "block";
    errorOrSuccess.classList.remove("success");
    errorOrSuccess.classList.add("warning");
    errorOrSuccess.innerText = error.response
      ? error.response.data.message
      : "An error occurred";
  }
}

submitbuttonElement.addEventListener("click", submitDataForPassword);
