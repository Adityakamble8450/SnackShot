import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import UserRegister from '../components/UserRegister'
import UserLogin from '../components/UserLogin'
import FoodPartnerRegister from '../components/FoodPartnerRegister'
import FoodPartnerLogin from '../components/FoodPartnerLogin'
import Home from '../../genral/Home'
import Dashboard from '../dashboard/Dashboard'
import Profile from "../dashboard/Profile"
import Saved from "../dashboard/Saved"
import UserProfile from "../dashboard/UserProfile"

const Approute = () => {
  return (
    <Router>
        <Routes>
            <Route path='/user/register' element={<UserRegister />} />
            <Route path='/user/login' element={<UserLogin />} />
            <Route path='/foodpartner/register' element={<FoodPartnerRegister />} />
            <Route path='/foodpartner/login' element={<FoodPartnerLogin />} />
            <Route path='/'element = {<Home/>}/>
            <Route path='/dashboard' element = {<Dashboard/>} />
            <Route path='/food-partner/:id'  element = {<Profile/> }/>
            <Route path='/saved' element={<Saved />} />
            <Route path='/profile' element={<UserProfile />} />
        </Routes>
    </Router>
  )
}

export default Approute
