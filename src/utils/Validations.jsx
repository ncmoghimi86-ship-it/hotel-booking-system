//اعتبارسنجی
//برای ایمیل
export const validateEmail = async (_, value) => {
  if (!value) {
    return Promise.reject("ایمیل الزامی است");
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return Promise.reject("ایمیل معتبر نیست");
  }
  return Promise.resolve();
};
//برای تلفن 
export const validatePhone=async(_,value)=>{
    if(!value){
        return Promise.reject("شماره تلفن الزامی است")
    }
    const phoneRegex=/^(\+98|0)?9\d{9}$/
    if(!phoneRegex.test(value)){
        return Promise.reject("تلفن معتبر نیست")
    }
    return Promise.resolve();
}
//برای رمز عبور
export const validatePassword=async(_,value)=>{
    if(!value){
        return Promise.reject("رمز عبور الزامی است")
    }
    if(value.length<8){
        return Promise.reject("رمز عبور باید حداقل 8 کارکتر داشته باشد")
    }
    const hasNumber=/\d/.test(value);
    const hasLetter=/[a-zA-Z]/.test(value);
    if(!hasNumber || !hasLetter){
        return Promise.reject(" رمزعبور باید شامل حروف و اعداد باشد ")
    }
    return Promise.resolve()

}