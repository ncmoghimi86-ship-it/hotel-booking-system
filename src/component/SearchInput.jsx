import React from 'react'
import { Input } from 'antd'

function SearchInput({value,onChange,placeholder="جستجوبراساس نام-نام خانوادگی  یا ایمیل کاربر"}) {
  return (
    <Input placeholder={placeholder} value={value} onChange={onChange} style={{marginBottom:16 , width:'50%'}}/>
   
  )
}
export default SearchInput