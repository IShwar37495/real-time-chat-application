// const inputElement = document.getElementById("email");
// const buttonElement = document.getElementById("forgot-password btn");

// const otpSubmitButton = document.getElementById("otp-button");

// const otpdiv = document.getElementById("otp");

// async function submitData(e) {
//   const email = inputElement.value;

//   const data = {
//     email: email,
//   };

//   try {
//     const response = await axios.post(
//       "http://localhost:5000/forgotPassword",
//       data
//     );

//     if (response) {
//       otpdiv.style.display = "block";
//     }

//     const otp = document.getElementById("otp-input").value;

//     const nextData = {
//       otp: otp,
//     };

//     const nextResponse = await axios.post(
//       "http://localhost:5000/verifyOtp",
//       nextData
//     );

//     // console.log("response", response.data);
//     // window.location.href = response.data.redirectUrl;
//   } catch (error) {
//     console.error("error:", error.message);
//   }
// }

// buttonElement.addEventListener("click", submitData);

const inputElement = document.getElementById("email");
const buttonElement = document.getElementById("forgot-password-btn");
const otpSubmitButton = document.getElementById("otp-button");
const otpdiv = document.getElementById("otp");

async function submitData(e) {
  e.preventDefault();

  const email = inputElement.value;

  try {
    const response = await axios.post("http://localhost:5000/forgotPassword", {
      email,
    });

    if (response.status === 201) {
      otpdiv.style.display = "block";
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function verifyOtp() {
  const otp = document.getElementById("otp-input").value;

  try {
    const response = await axios.post("http://localhost:5000/verifyOtp", {
      email: inputElement.value,
      otp,
    });

    console.log(inputElement.value);

    if (response.status === 200) {
      window.location.href = response.data.redirectUrl;
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

buttonElement.addEventListener("click", submitData);
otpSubmitButton.addEventListener("click", verifyOtp);
