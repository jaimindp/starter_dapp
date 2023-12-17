import * as dotenv from 'dotenv'
dotenv.config({ path: '../../.env.local' })
import { ethers } from 'ethers'

const API_KEY = process.env.NEXT_PUBLIC_SOCKET_TEST_API
console.log(API_KEY)

// Function to get a quote from the DLN API
async function getDLNQuote() {
  // Construct the URL with query parameters
  const url =
    // 'https://api.dln.trade/v1.0/dln/order/quote?srcChainId=56&srcChainTokenIn=0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d&srcChainTokenInAmount=100000000000000000000&dstChainId=43114&dstChainTokenOut=0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7&prependOperatingExpenses=true&affiliateFeePercent=0.1'
  const url = `https://api.dln.trade/v1.0/dln/order/quote?srcChainId=${fromChainId}&srcChainTokenIn=${fromAssetAddress}&srcChainTokenInAmount=${amount}&dstChainId=${toChainId}&dstChainTokenOut=${toAssetAddress}&prependOperatingExpenses=true&affiliateFeePercent=0.1`;


  const response = await fetch(url, { method: 'GET' })
  const json = await response.json()
  return json
}

// Function to execute a trade on DLN
async function executeDLNTrade(/* parameters based on the DLN API requirements */) {
  // Call the DLN API endpoint for trade execution
  // Handle the response and any required transactions
}

// Makes a GET request to Socket APIs for quote
async function getQuote(
  fromChainId,
  fromTokenAddress,
  toChainId,
  toTokenAddress,
  fromAmount,
  userAddress,
  uniqueRoutesPerBridge,
  sort,
  singleTxOnly
) {
  const response = await fetch(
    `https://api.dln.trade/v1.0/dln/order/quote?srcChainId=${fromChainId}&srcChainTokenIn=${fromAssetAddress}&srcChainTokenInAmount=${amount}&dstChainId=${toChainId}&dstChainTokenOut=${toAssetAddress}&prependOperatingExpenses=true&affiliateFeePercent=0.1`,
    // `https://api.socket.tech/v2/quote?fromChainId=${fromChainId}&fromTokenAddress=${fromTokenAddress}&toChainId=${toChainId}&toTokenAddress=${toTokenAddress}&fromAmount=${fromAmount}&userAddress=${userAddress}&uniqueRoutesPerBridge=${uniqueRoutesPerBridge}&sort=${sort}&singleTxOnly=${singleTxOnly}`,
    {
      method: 'GET',
      headers: {
        'API-KEY': API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )

  const json = await response.json()
  return json
}

// Makes a POST request to Socket APIs for swap/bridge transaction data
async function getRouteTransactionData(route) {
  const response = await fetch('https://api.socket.tech/v2/build-tx', {
    method: 'POST',
    headers: {
      'API-KEY': API_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ route: route }),
  })

  const json = await response.json()
  return json
}

// GET request to check token allowance given to allowanceTarget by owner
async function checkAllowance(chainId, owner, allowanceTarget, tokenAddress) {
  const response = await fetch(
    `https://api.socket.tech/v2/approval/check-allowance?chainID=${chainId}&owner=${owner}&allowanceTarget=${allowanceTarget}&tokenAddress=${tokenAddress}`,
    {
      method: 'GET',
      headers: {
        'API-KEY': API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )

  const json = await response.json()
  return json
}

// Fetches transaction data for token approval
async function getApprovalTransactionData(chainId, owner, allowanceTarget, tokenAddress, amount) {
  const response = await fetch(
    `https://api.socket.tech/v2/approval/build-tx?chainID=${chainId}&owner=${owner}&allowanceTarget=${allowanceTarget}&tokenAddress=${tokenAddress}&amount=${amount}`,
    {
      method: 'GET',
      headers: {
        'API-KEY': API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )

  const json = await response.json()
  return json
}

// Fetches status of the bridging transaction
async function getBridgeStatus(transactionHash, fromChainId, toChainId) {
  const response = await fetch(
    `https://api.socket.tech/v2/bridge-status?transactionHash=${transactionHash}&fromChainId=${fromChainId}&toChainId=${toChainId}`,
    {
      method: 'GET',
      headers: {
        'API-KEY': API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )

  const json = await response.json()
  return json
}

// Main function
async function dlnSwap() {
  // Uses web3 wallet in browser as provider
  const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')

  // Prompt user for account connections
  await provider.send('eth_requestAccounts', [])

  // Stores signer
  const signer = provider.getSigner()
  const addy = await signer.getAddress()
  console.log(signer)
  console.log(addy)

  // Bridging Params fetched from users
  const fromChainId = 137

  // const fromChainId = 1;
  const toChainId = 56
  // const fromAssetAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
  const fromAssetAddress = '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'
  // const fromAssetAddress = "0x0000000000000000000000000000000000001010";
  // const fromAssetAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const toAssetAddress = '0x55d398326f99059fF775485246999027B3197955'
  const amount = 10000000 // 100 USDC, USDC is 6 decimals
  // const userAddress = "0x3e8cB4bd04d81498aB4b94a392c334F5328b237b";
  const userAddress = '0x89d9Dd2e85ecC305E276f51BB21fd4C708Be9487'
  const uniqueRoutesPerBridge = true // Returns the best route for a given DEX / bridge combination
  const sort = 'output' // "output" | "gas" | "time"
  const singleTxOnly = true

  // Quote for bridging 100 USDC on Polygon to USDT on BSC
  // For single transaction bridging, mark singleTxOnly flag as true in query params
  const quote = await getQuote(
    fromChainId,
    fromAssetAddress,
    toChainId,
    toAssetAddress,
    amount,
    userAddress,
    uniqueRoutesPerBridge,
    sort,
    singleTxOnly
  )
  console.log(quote)

  // Choosing first route from the returned route results
  const route = quote.result.routes[0]
  console.log(route)

  // Fetching transaction data for swap/bridge tx
  const apiReturnData = await getRouteTransactionData(route)

  // Used to check for ERC-20 approvals
  const approvalData = apiReturnData.result.approvalData
  const { allowanceTarget, minimumApprovalAmount } = approvalData
  // const { allowanceTarget, minimumApprovalAmount } =approvalData;

  // approvalData from apiReturnData is null for native tokens
  // Values are returned for ERC20 tokens but token allowance needs to be checked
  // if (approvalData !== null && approvalData !== undefined) {
  if (approvalData !== null) {
    // const { allowanceTarget, minimumApprovalAmount } =approvalData;
    // Fetches token allowance given to Socket contracts
    const allowanceCheckStatus = await checkAllowance(fromChainId, userAddress, allowanceTarget, fromAssetAddress)
    console.log(allowanceCheckStatus)
    const allowanceValue = allowanceCheckStatus.result?.value

    // If Socket contracts don't have sufficient allowance
    if (minimumApprovalAmount > allowanceValue) {
      // Approval tx data fetched
      const approvalTransactionData = await getApprovalTransactionData(
        fromChainId,
        userAddress,
        allowanceTarget,
        fromAssetAddress,
        amount
      )

      const gasPrice = await signer.getGasPrice()
      console.log(gasPrice)
      // console.log(signer)

      const gasEstimate = await provider.estimateGas({
        // from: signer.address,
        from: addy,
        to: approvalTransactionData.result?.to,
        value: '0x00',
        data: approvalTransactionData.result?.data,
        gasPrice: gasPrice,
      })

      console.log(gasEstimate)

      const tx = await signer.sendTransaction({
        from: approvalTransactionData.result?.from,
        to: approvalTransactionData.result?.to,
        value: '0x00',
        data: approvalTransactionData.result?.data,
        gasPrice: gasPrice,
        gasLimit: gasEstimate,
      })

      // Initiates approval transaction on user's frontend which user has to sign
      const receipt = await tx.wait()

      console.log('Approval Transaction Hash :', receipt.transactionHash)
    }
  }

  const gasPrice = await signer.getGasPrice()

  console.log(gasPrice)
  console.log('addy', addy)
  console.log('to', apiReturnData.result.txTarget)
  console.log('data', apiReturnData.result.txData)
  console.log('value', apiReturnData.result.value)

  const gasEstimate = await provider
    .estimateGas({
      // from: signer.address,
      from: addy,
      to: apiReturnData.result.txTarget,
      value: apiReturnData.result.value,
      data: apiReturnData.result.txData,
      gasPrice: gasPrice,
    })
    .catch(e => console.log(e))

  console.log('\n\ngasEstimate\n\n')
  console.log(gasEstimate)

  try {
    const tx = await signer.sendTransaction({
      // from: signer.address,
      from: addy,
      to: apiReturnData.result.txTarget,
      data: apiReturnData.result.txData,
      value: apiReturnData.result.value,
      gasPrice: gasPrice,
      gasLimit: gasEstimate,
    })
  } catch (e) {
    console.log(e)
    return
  }

  // Initiates swap/bridge transaction on user's frontend which user has to sign
  const receipt = await tx.wait()

  const txHash = receipt.transactionHash

  console.log('Bridging Transaction : ', receipt.transactionHash)

  // Checks status of transaction every 20 secs
  const txStatus = setInterval(async () => {
    const status = await getBridgeStatus(txHash, fromChainId, toChainId)

    console.log(`SOURCE TX : ${status.result.sourceTxStatus}\nDEST TX : ${status.result.destinationTxStatus}`)

    if (status.result.destinationTxStatus == 'COMPLETED') {
      console.log('DEST TX HASH :', status.result.destinationTransactionHash)
      clearInterval(txStatus)
    }
  }, 20000)
}

export default dlnSwap

dlnSwap()
