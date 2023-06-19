class TextValidator {
  constructor() {}

  /**
   * Validates the received text
   * @param {string} text  the text to be produced
   * @returns true if the text is valid, false if it is not
   */
  validateText = async (text) => {
    return /^[^!@#$%^&*()_+=[\]{};':"\\|<>/?`~]*$/.test(text);
  };
}
export default new TextValidator();
