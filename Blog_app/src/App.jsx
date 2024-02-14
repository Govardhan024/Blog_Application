import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Post from './Post'
import Header from './Header'
import {Route, Routes} from "react-router-dom" 
import Layout from './Layout'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import RagisterPage from './pages/RagisterPage'
import Createpost from './pages/Createpost'
import Postpage from './pages/Postpage'
import {UserContextProvider} from "./UserContext"
import Editpost from './pages/Editpost'

function App() {
 

  return (
  <UserContextProvider>
    <Routes>
        <Route path='/' element={<Layout/>}>
            <Route index element={<IndexPage/>}></Route>
            <Route path='/login' element={<LoginPage/>}></Route>
            <Route path='/register' element={<RagisterPage/>}></Route>
            <Route path='/create' element={<Createpost/>}></Route>
            <Route path='/post/:id' element={<Postpage/>}></Route>
            <Route path='/edit/:id' element={<Editpost />}/>
        </Route>
      </Routes>
    </UserContextProvider>
  )
}

export default App
