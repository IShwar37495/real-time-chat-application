const buttonElement = document.getElementById("btn");
const loaderElement = document.getElementById("loader");

async function submitData(e) {
  e.preventDefault();

  const email = document.getElementById("usermail").value;
  const password = document.getElementById("user-password").value;
  const data = { email: email, password: password };

  try {
    // Show the loader
    loaderElement.classList.add("show");

    const response = await axios.post("http://localhost:5000/login", data);
    console.log("response", response.data);

    if (response.data.userId) {
      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("email", response.data.email);
      sessionStorage.setItem("name", response.data.name);
      console.log(response.data.name);
    }

    // Navigate to the new page
    window.location.href = response.data.redirectUrl;
  } catch (error) {
    console.error("error:", error.message);

    if (error.response && error.response.status === 400) {
      const errorMessageElement = document.getElementById("error-element");
      errorMessageElement.style.display = "block";
      errorMessageElement.innerText = "Incorrect email or password";

      const usermail = document.getElementById("usermail");
      const userPassword = document.getElementById("user-password");

      usermail.classList.add("warning");
      userPassword.classList.add("warningforPassword");

      setTimeout(() => {
        errorMessageElement.style.display = "none";
      }, 3000);
    } else {
      const errorMessageElement = document.getElementById("error-element");
      errorMessageElement.style.display = "block";
      errorMessageElement.innerText =
        "An error occurred. Please try again later.";

      setTimeout(() => {
        errorMessageElement.style.display = "none";
      }, 3000);
    }

    loaderElement.classList.remove("show");
  }
}

buttonElement.addEventListener("click", submitData);
