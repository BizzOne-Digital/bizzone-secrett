import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

// Note: StrictMode disabled intentionally — the dashboard panel uses
// imperative DOM manipulation that must only initialize once.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)