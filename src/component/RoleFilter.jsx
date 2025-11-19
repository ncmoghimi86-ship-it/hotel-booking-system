
import React from 'react'
import { Select} from 'antd'
const{Option}=Select

function RoleFilter({value,onChange}) {
  return (
    <Select placeholder='فیلتر بر اساس نقش کاربران'
     value={value} onChange={onChange} 
     style={{width:'50%', marginBottom:16}}
     >
        <Option value='all'>همه نقش ها</Option>
        <Option value='Admin'>مدیر</Option>
        <Option value='Hotel Manager'>مدیر هتل</Option>
        <Option value='Guest'>مهمان</Option>
        
    </Select>
  )
}

export default RoleFilter