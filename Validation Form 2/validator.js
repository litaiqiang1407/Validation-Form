function Validation(formSelector) {
  const formRules = {};

  const getParents = (element, formGroupSelector) => {
    while (element.parentElement) {
      if (element.parentElement.matches(formGroupSelector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  };

  const validationRules = {
    required(value) {
      return value.trim() ? undefined : "The field is required";
    },
    email(value) {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "The field is email";
    },
    min(min) {
      return (value) => {
        return value.length >= min
          ? undefined
          : `Password must be at least ${min} characters`;
      };
    },
    confirmed(value) {
      return value === document.querySelector("#password").value
        ? undefined
        : "Confirm password doesn't matched";
    },
  };

  const formElement = document.querySelector(formSelector);

  if (formElement) {
    const inputElements = formElement.querySelectorAll("[name][rules]");

    for (let input of inputElements) {
      const rules = input.getAttribute("rules").split("|");

      for (let rule of rules) {
        let funcRules = validationRules[rule];

        if (rule.includes(":")) {
          const ruleInfo = rule.split(":");
          funcRules = validationRules[ruleInfo[0]](ruleInfo[1]);
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(funcRules);
        } else {
          formRules[input.name] = [funcRules];
        }
      }
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
    function handleValidate(e) {
      const rules = formRules[e.target.name];

      let errorMessage;

      for (let rule of rules) {
        errorMessage = rule(e.target.value);
        if (errorMessage) break;
      }

      if (errorMessage) {
        const formGroupElement = getParents(e.target, ".form-group");
        if (formGroupElement) {
          formGroupElement.classList.add("invalid");

          const errorMessageElement =
            formGroupElement.querySelector(".form-message");

          if (errorMessageElement) {
            errorMessageElement.innerText = errorMessage;
          }
        }
      }
      return !errorMessage;
    }

    function handleClearError(e) {
      const formGroupElement = getParents(e.target, ".form-group");
      if (formGroupElement.classList.contains("invalid")) {
        formGroupElement.classList.remove("invalid");
        const errorMessageElement =
          formGroupElement.querySelector(".form-message");

        if (errorMessageElement) {
          errorMessageElement.innerText = "";
        }
      }
    }

    formElement.onsubmit = (e) => {
      e.preventDefault();

      let isValid = true;

      const inputElements = formElement.querySelectorAll("[name][rules]");

      for (let input of inputElements) {
        if (!handleValidate({ target: input })) {
          isValid = false;
        }
      }

      if (isValid) {
        if (typeof this.onSubmit === "function") {
          const enableInputs = formElement.querySelectorAll("[name]");
          const formValues = Array.from(enableInputs).reduce(
            (values, inputs) => {
              switch (inputs.type) {
                case "radio":
                  values[inputs.name] = formElement.querySelector(
                    "input[name='" + inputs.name + "']:checked"
                  ).value;
                  break;
                case "checkbox":
                  if (!inputs.matches(":checked")) {
                    if (!values[inputs.name]) {
                      values[inputs.name] = "";
                      return values;
                    }
                    return values;
                  }
                  if (!Array.isArray(values[inputs.name])) {
                    values[inputs.name] = [];
                  }
                  values[inputs.name].push(inputs.value);
                  break;
                case "file":
                  values[inputs.name] = inputs.files;
                  break;
                default:
                  values[inputs.name] = inputs.value;
              }
              return values;
            },
            {}
          );

          this.onSubmit(formValues);
        }
      }
    };
  }
}
