import { useState } from "react";
import{ notification} from'antd';

import { createUser as createUserAPI } from "../api/jsonServer";

 export const useCreateUser=()=>{
    const[isLoading,setIsLoading]=useState(false)
    const createUser=async(userData)=>{
        try{
            setIsLoading(true);
            const response=await createUserAPI(userData);
            notification.success({
                message:'موفقیت آمیز',
                description:'حساب کاربری شما با موفقیت ایجاد شد'
            }
            );
            return{success:true ,data:response}
        }
        catch(error){
            notification.error({
                message:' خطا رخ داد',
                description:error.message ||' خطایی در ثبت نام رخ داده است'
            })
            return{success:false ,error}
        }
          finally{
             setIsLoading(false)   
            }
    };
    return{
        createUser,isLoading
    }

 }