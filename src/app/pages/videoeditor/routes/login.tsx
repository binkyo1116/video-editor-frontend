import {Link} from 'react-router-dom'
import styles from './login.module.css'
// import GoogleLogin from "react-google-login";
import axios from 'axios'
import {useEffect} from 'react'
import {GoogleLogin} from '@react-oauth/google'

export default function Login(props: {
}) {

  return (
    <div className={styles.container}>
      <div></div>
      <div className={styles.login}>
        <div className={styles.loginBox} >
          <Link to='/'>
            {/* <img className={styles.logo} src='/logo192.png' alt='' /> */}
          </Link>
          {/* <button className={styles.button} title="Sign in with Google">
                    <img className={styles.google} src="/google.svg"/> Sign in with Google
                </button> */}
          {/* <GoogleLogin onSuccess={handleLogin} /> */}
        </div>
      </div>
    </div>
  )
}
