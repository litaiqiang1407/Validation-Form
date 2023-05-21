// Validation
function Validation(options) {
  const getParentElement = (element, selectParent) => {
    while (element.parentElement) {
      if (element.parentElement.matches(selectParent)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  };

  const selectorRules = {};

  const validate = (inputElements, errorMessageElement, rule) => {
    let errorMessage;
    const rules = selectorRules[rule.selector];

    for (let i = 0; i < rules.length; i++) {
      switch (inputElements.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElements.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorMessageElement.innerText = errorMessage;
      inputElements.parentElement.classList.add("invalid");
    } else {
      errorMessageElement.innerText = "";
      inputElements.parentElement.classList.remove("invalid");
    }

    return !errorMessage;
  };
  const haveInput = (inputElements, errorMessageElement) => {
    errorMessageElement.innerText = "";
    inputElements.parentElement.classList.remove("invalid");
  };

  const formElement = document.querySelector(options.formSelector);

  if (formElement) {
    formElement.onsubmit = (e) => {
      e.preventDefault();

      let isFormValid = true;

      options.rules.forEach((rule) => {
        const inputElements = formElement.querySelector(rule.selector);
        const formGroupElements = getParentElement(
          inputElements,
          options.formGroupSelector
        );
        const errorMessageElement = formGroupElements.querySelector(
          options.errorMessageSelector
        );
        let isValid = validate(inputElements, errorMessageElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
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

          options.onSubmit(formValues);
        } else {
        }
      }
    };

    options.rules.forEach((rule) => {
      const inputElements = formElement.querySelectorAll(rule.selector);
      const inputElement = formElement.querySelector(rule.selector);

      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }
      const formGroupElements = getParentElement(
        inputElement,
        options.formGroupSelector
      );
      const errorMessageElement = formGroupElements.querySelector(
        options.errorMessageSelector
      );
      Array.from(inputElements).forEach((inputElement) => {
        inputElement.onblur = () => {
          validate(inputElement, errorMessageElement, rule);
        };

        inputElement.oninput = () => {
          haveInput(inputElement, errorMessageElement);
        };
        inputElement.onchange = () => {
          validate(inputElement, errorMessageElement, rule);
        };
      });
    });
  }
}

// Rules
Validation.isRequired = (selector) => {
  return {
    selector,
    test(value) {
      if (typeof value === "string") {
        return value.trim() ? undefined : "The field is required";
      } else {
        return value ? undefined : "The field is required";
      }
    },
  };
};

Validation.isEmail = (selector) => {
  return {
    selector,
    test(value) {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "The field is email";
    },
  };
};

Validation.isPassword = (selector, min) => {
  return {
    selector,
    test(value) {
      return value.length >= min
        ? undefined
        : `Password must be at least ${min} characters`;
    },
  };
};

Validation.isConfirmedPassword = (selector, getConfirmValue) => {
  return {
    selector,
    test(value) {
      return value === getConfirmValue()
        ? undefined
        : "Confirm password doesn't matched";
    },
  };
};
