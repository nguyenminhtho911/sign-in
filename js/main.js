// Ẩn/hiện password
const togglePassword = document.querySelector("#toggle-password");
const password = document.querySelector("#password");
showHidePassword = (e) => {
  const type = password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
  e.target.classList.toggle("uil-eye-slash");
};
togglePassword.addEventListener("click", showHidePassword);

// Validator
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    var errorMessage;

    // Lấy ra các rules của selector
    var rules = selectorRules[rule.selector];

    // Lặp qua từng rule & kiểm tra
    // Nếu có lỗi thì dừng việc kiểm
    for (var i = 0; i < rules.length; ++i) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
    }

    return !errorMessage;
  }

  // Lấy element của form cần validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
    // Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      // Lặp qua từng rules và validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Trường hợp submit với javascript
        var enableInputs = formElement.querySelectorAll("[name]");
        var formValues = Array.from(enableInputs).reduce(function (
          values,
          input
        ) {
          switch (input.type) {
            case "checkbox":
              if (!input.matches(":checked")) {
                values[input.name] = 0;
              } else {
                values[input.name] = 1;
              }
              break;
            default:
              values[input.name] = input.value;
          }

          return values;
        },
        {});
        options.onSubmit(formValues);
      }
    };

    // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur)
    options.rules.forEach(function (rule) {
      // Lưu lại các rules cho mỗi input
      selectorRules[rule.selector] = [rule.test];

      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        // Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
      });
    });
   
  }
}

// Định nghĩa rules
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra gì cả (undefined)
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "This field must be email";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Please enter at least ${min} characters`;
    },
  };
};

Validator({
  form: "#form-signin",
  formGroupSelector: ".form-group",
  errorSelector: ".form-message",
  rules: [Validator.isEmail("#email"), Validator.minLength("#password", 6)],
  onSubmit: function (data) {
    // Call API
    console.log(data);
  },
});
