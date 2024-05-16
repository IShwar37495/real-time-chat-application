const btnElement = document.getElementById("btn");

async function submitData(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  function isValidEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  }

  function validName(name) {
    const pattern = /\s/;
    return !pattern.test(name);
  }

  if (!validName(name)) {
    const registrationFlag = document.getElementById(
      "registration-failed-or-successful"
    );
    registrationFlag.classList.add("warning");
    registrationFlag.classList.remove("success");
    registrationFlag.style.display = "block";
    registrationFlag.innerText = "spaces are not allowed in name";

    return;
  }

  if (!isValidEmail(email)) {
    const registrationFlag = document.getElementById(
      "registration-failed-or-successful"
    );
    registrationFlag.classList.add("warning");
    registrationFlag.classList.remove("success");
    registrationFlag.style.display = "block";
    registrationFlag.innerText = "Please enter valid mail";

    return;
  }

  const data = {
    name: name,
    email: email,
    password: password,
    confirmPassword: confirmPassword,
  };

  try {
    const response = await axios.post("http://localhost:5000/register", data);

    console.log("response", response.data);
    const registrationFlag = document.getElementById(
      "registration-failed-or-successful"
    );
    registrationFlag.classList.remove("warning");
    registrationFlag.classList.add("success");
    registrationFlag.style.display = "block";
    registrationFlag.innerText = response.data.message;

    setTimeout(() => {
      window.location.href = response.data.redirectUrl;
    }, 1000);
  } catch (error) {
    console.error("error:", error.message);

    if (error.response && error.response.status === 400) {
      const registrationFlag = document.getElementById(
        "registration-failed-or-successful"
      );
      registrationFlag.classList.remove("success");
      registrationFlag.classList.add("warning");
      registrationFlag.style.display = "block";
      registrationFlag.innerText = error.response.data.message;

      setTimeout(() => {
        registrationFlag.style.display = "none";
      }, 3000);
    }
  }
}

btnElement.addEventListener("click", submitData);
