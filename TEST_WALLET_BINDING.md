# Test Wallet Binding - Manual Testing Guide

## Setup Required
1. Start blockchain: `npm run node` (in project root)
2. Deploy contract: `npm run deploy`
3. Start frontend: `npm run dev` (in frontend folder)
4. Open browser: http://localhost:5173

## Test Scenario 1: Admin User Wallet Binding

### Pre-requisites
- Admin user already created and logged in
- MetaMask installed and connected to localhost:8545
- Admin account has the proper test wallet addresses in MetaMask

### Steps

1. **Login as Admin**
   - Navigate to /profile or click profile tab
   - Admin should be logged in

2. **Check Initial Wallet State**
   - If wallet already bound: Should see "🔄 Cambiar Wallet" and "🔓 Desvincularse" buttons
   - If no wallet: Should see "🔗 Vincular Wallet" button
   - **Expected**: One of the above buttons is visible

3. **Click Wallet Binding Button**
   - If has wallet: Click "🔄 Cambiar Wallet"
   - If no wallet: Click "🔗 Vincular Wallet"
   - **Expected**: Blue box appears with "🦊 Conectar MetaMask" button

4. **Click Connect MetaMask**
   - Click "🦊 Conectar MetaMask" button
   - **CRITICAL**: MetaMask popup should appear
   - If NOT: Open browser console (F12) and check for errors
   - Look for logs like:
     ```
     ✅ MetaMask detectado
     ⏳ Solicitando cuentas de MetaMask...
     📢 Llamando window.ethereum.request({method: eth_requestAccounts})
     ```

5. **Select Account in MetaMask**
   - MetaMask dialog should show available accounts
   - Select one account
   - Click "Next" then "Connect"
   - **Expected**: Browser shows list of available wallets to bind

6. **Select Wallet to Bind**
   - Choose a wallet from the list shown
   - **Expected**: Wallet address appears selected (green background)
   - See "⏳ Conectando..." button while processing
   - Then: "✅ Wallet vinculada correctamente" message

7. **Verify Binding**
   - Wallet should appear in the profile with "Copiar" button
   - Should now see "🔄 Cambiar Wallet" and "🔓 Desvincularse" buttons
   - Refresh page - wallet should still be there

### Browser Console Checks
Open F12 Developer Tools → Console tab and look for:
```
📱 loadUserDetails iniciada
   currentUser.username: admin
   currentUser.role: ADMIN
   currentUser.walletAddress: <wallet or null>

✅ MetaMask detectado
⏳ Solicitando cuentas de MetaMask...
✅ Cuentas obtenidas: 2 cuentas
   [0]: 0x...
   [1]: 0x...

✅ SELECTOR DE CUENTAS LISTO
```

---

## Test Scenario 2: Regular User - Cancellation Test

### Pre-requisites
- Regular user (not admin) already created and logged in
- User has NO wallet bound yet
- MetaMask installed

### Steps

1. **Login as Regular User**
   - Login with a non-admin user
   - Go to profile

2. **Click Vincular Wallet**
   - Click "🔗 Vincular Wallet" button
   - Blue box appears with MetaMask button

3. **Click Connect MetaMask**
   - Click "🦊 Conectar MetaMask"
   - MetaMask popup appears

4. **Cancel in MetaMask**
   - MetaMask dialog shows account selection
   - Click "Cancel" button in MetaMask popup
   - **Expected**: Popup closes, user sees "❌ Operación cancelada por el usuario"
   - **CRITICAL**: Wallet should NOT be saved locally

5. **Verify Wallet NOT Saved**
   - Message "❌ Operación cancelada por el usuario" should appear
   - Button should return to "🔗 Vincular Wallet" (not showing wallet)
   - In browser console, should see:
     ```
     Rechazaste la solicitud de conexión a MetaMask
     ```
   - Refresh page - wallet should STILL be missing

6. **Repeat - Successful Binding**
   - Click "🔗 Vincular Wallet" again
   - Click "🦊 Conectar MetaMask"
   - This time, select account in MetaMask and click "Next"
   - Select wallet from list
   - **Expected**: "✅ Wallet vinculada correctamente" appears
   - Wallet should now be visible in profile

7. **Verify Wallet Saved**
   - Wallet appears in profile
   - See "🔄 Cambiar Wallet" and "🔓 Desvincularse" buttons
   - Refresh page - wallet is still there

---

## Debugging Tips

### If MetaMask doesn't open:
1. Check browser console (F12 → Console)
2. Look for error messages like:
   - "MetaMask no está instalado"
   - "No se pudo conectar a MetaMask"
   - Error codes from MetaMask
3. Ensure MetaMask is connected to the right network
4. Ensure you're at http://localhost:5173 (not another tab)

### If Wallet saves on cancellation:
1. Check localStorage in browser DevTools:
   - F12 → Application → Local Storage → http://localhost:5173
   - Look for `currentUser` entry
   - `walletAddress` should be `null` after cancellation
   - `allUsers` should not have the wallet address for that user

### If Wallet doesn't show after binding:
1. Check console for blockchain errors
2. Look for "linkWalletToUser" transaction in logs
3. Verify blockchain is running: `npm run node`
4. Verify contract was deployed: `npm run deploy`
5. Check contract address in localStorage matches deployed contract

---

## Expected Console Logs for Success

### Admin Binding Wallet:
```
📱 loadUserDetails iniciada
   currentUser.username: admin
   currentUser.role: ADMIN
✅ Datos recuperados del blockchain: {...walletAddress: null}

✅ MetaMask detectado
⏳ Esperando confirmación de MetaMask...
⏳ Esperando confirmación de transacción...
✅ Wallet vinculada exitosamente en blockchain
💾 Guardando wallet en localStorage
=== ✅ VINCULACIÓN COMPLETADA ===
```

### User Cancelling:
```
⏳ Esperando confirmación de MetaMask...
❌ Error en blockchain: Error: The user rejected the request
❌ Operación cancelada por el usuario
```
(Wallet NOT saved)

### User Confirming:
```
⏳ Esperando confirmación de MetaMask...
⏳ Esperando confirmación de transacción...
✅ Wallet vinculada exitosamente en blockchain
💾 Guardando wallet en localStorage
✅ Wallet vinculada correctamente
=== ✅ VINCULACIÓN COMPLETADA ===
```
