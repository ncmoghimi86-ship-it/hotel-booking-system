
import React from 'react'
import { Select } from 'antd'
const{Option}=Select

function StatusFilter({value,onChange}) {
  return (
    <Select placeholder='فیلتربراساس وضعیت کاربران' value={value} onChange={onChange} style={{marginBottom:16,width:'50%'}}>
        <Option value='all'> همه وضعیت ها </Option>
        <Option value='active'>فعال</Option>
        <Option value='inactive'> غیرفعال</Option>
    </Select>
  )
}

export default StatusFilter