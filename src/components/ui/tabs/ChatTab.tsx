"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain, useChainId, useConnect, useDisconnect } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { Button } from "../Button";
import { truncateAddress } from "../../../lib/truncateAddress";
import { renderError } from "../../../lib/errorUtils";
import { formatTransactionData, createTransactionSummary, type TransactionData } from "../../../lib/tokenUtils";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}



interface TransactionPreviewProps {
  data: TransactionData;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

/**
 * Reusable copy button component with smooth animations
 */
function CopyButton({ text, label = "Copy", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
        copied 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      } ${className}`}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

/**
 * Modern transaction preview with glassmorphism design
 */
function TransactionPreview({ data, onApprove, onReject, isLoading }: TransactionPreviewProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-100/80 dark:from-blue-900/20 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse"></div>
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Transaction Preview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ready to execute</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-full shadow-sm">
            {data.txPlan.length} steps
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-4 py-4 px-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Action</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">
                {data.action}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Token</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.tokenName}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.amount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Network</span>
              <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 py-1 rounded">
                Arbitrum
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <Button
            onClick={onApprove}
            disabled={isLoading}
            isLoading={isLoading}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve & Sign
              </>
            )}
          </Button>
          <Button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simplified message bubble component with guaranteed visibility
 */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 ${isUser ? 'space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isUser 
            ? 'bg-blue-600' 
            : isSystem 
            ? 'bg-orange-600'
            : 'bg-purple-600'
        }`}>
          {isUser ? (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          ) : isSystem ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className={`px-4 py-3 rounded-2xl shadow-lg border ${
          isUser
            ? 'bg-blue-600 text-white border-blue-600 rounded-br-md'
            : isSystem
            ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-orange-200 dark:border-orange-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 rounded-bl-md'
        }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {message.content}
          </p>
          <p className={`text-xs mt-2 ${
            isUser ? 'text-blue-100' : isSystem ? 'text-orange-700' : 'text-gray-500'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Transaction success message with copy functionality
 */
function TransactionSuccess({ hash }: { hash: string }) {
  const arbiscanUrl = `https://arbiscan.io/tx/${hash}`;
  
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 border border-green-200 dark:border-green-700/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="font-medium text-green-800 dark:text-green-200">Transaction Successful!</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-700 dark:text-green-300">Transaction Hash:</span>
          <CopyButton text={hash} label="Copy Hash" />
        </div>
        <p className="text-xs font-mono text-green-600 dark:text-green-400 break-all bg-green-100/50 dark:bg-green-900/30 p-2 rounded">
          {hash}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-green-700 dark:text-green-300">View on Explorer:</span>
          <div className="flex space-x-2">
            <CopyButton text={arbiscanUrl} label="Copy Link" />
            <a
              href={arbiscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition-colors duration-200"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Arbiscan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ChatTab component provides a ChatGPT-like interface for DeFi interactions.
 */
export function ChatTab() {
  // --- State ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Welcome to your DeFi Assistant!\n\nI can help you with lending, borrowing, swapping, and other DeFi operations on Arbitrum. Just tell me what you\'d like to do in plain English!\n\nExamples:\n• "Supply 0.1 USDC"\n• "Borrow 0.05 ETH"\n• "Check my lending positions"',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<TransactionData | null>(null);
  const [currentTxIndex, setCurrentTxIndex] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);

  // --- Refs ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Hooks ---
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isChainSwitching } = useSwitchChain();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    sendTransaction,
    error: txError,
    isError: isTxError,
    isPending: isTxPending,
  } = useSendTransaction();

  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  // --- Effects ---
  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingTransaction]);

  useEffect(() => {
    // Auto-focus the input when component mounts and is ready
    if (inputRef.current && isConnected && chainId === arbitrum.id) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isConnected, chainId]);

  useEffect(() => {
    if (isTxConfirmed && txHash && pendingTransaction) {
      const summary = createTransactionSummary(pendingTransaction);
      addMessage('system', `🎉 Transaction confirmed! ${summary} completed successfully.`);
      
      // Check if there are more transactions to process
      if (currentTxIndex + 1 < pendingTransaction.txPlan.length) {
        // Don't reset yet, move to next transaction
        return;
      }
      
      // All transactions completed, reset state
      setPendingTransaction(null);
      setCurrentTxIndex(0);
      setTxHash(null);
    }
  }, [isTxConfirmed, txHash, pendingTransaction, currentTxIndex]);

  // --- Helpers ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type: ChatMessage['type'], content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date(),
    };
    console.log('Adding message:', newMessage);
    setMessages(prev => {
      const newMessages = [...prev, newMessage];
      console.log('Updated messages:', newMessages);
      return newMessages;
    });
  };

  // --- Handlers ---
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    console.log('Form submitted with input:', inputValue);

    if (!isConnected) {
      addMessage('system', '🔗 Please connect your MetaMask wallet first by going to the Wallet tab.');
      return;
    }

    if (chainId !== arbitrum.id) {
      addMessage('system', '🔄 Switching to Arbitrum network...');
      try {
        await switchChain({ chainId: arbitrum.id });
        addMessage('system', '✅ Successfully switched to Arbitrum network.');
      } catch (error) {
        addMessage('system', '❌ Failed to switch to Arbitrum network. Please switch manually in your wallet.');
        return;
      }
    }

    const userMessage = inputValue.trim();
    console.log('Adding user message:', userMessage);
    addMessage('user', userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/lending-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction: userMessage,
          userAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data.status.state === 'completed') {
        const artifact = result.data.artifacts?.[0];
        if (artifact?.parts?.[0]?.data) {
          const artifactData = artifact.parts[0].data;
          
          addMessage('assistant', result.data.status.message.parts[0].text);
          
          // Check if this is transaction data
          if (artifactData.txPreview && artifactData.txPlan) {
            const { txPreview, txPlan } = artifactData;
            
            const rawTransactionData: TransactionData = {
              tokenName: txPreview.tokenName,
              amount: txPreview.amount,
              action: txPreview.action,
              chainId: txPreview.chainId,
              txPlan,
            };
            
            // Format the transaction data to ensure correct decimal handling
            const formattedTransactionData = formatTransactionData(rawTransactionData);
            
            // Debug logging to help identify conversion issues
            console.log('Raw Transaction Data:', rawTransactionData);
            console.log('Formatted Transaction Data:', formattedTransactionData);
            console.log('Transaction Plan:', txPlan);
            
            // Add a formatted summary message
            const summary = createTransactionSummary(formattedTransactionData);
            addMessage('system', `📋 Transaction Summary: ${summary}`);
            
            setPendingTransaction(formattedTransactionData);
            setCurrentTxIndex(0);
          }
          // Check if this is positions/balance data
          else if (artifactData.positions && Array.isArray(artifactData.positions) && artifactData.positions.length > 0) {
            const positionData = artifactData.positions[0];
            const formatUsdValue = (value: string) => {
              const num = parseFloat(value);
              if (num === 0) return "$0.00";
              if (num < 0.01) return `$${num.toFixed(6)}`;
              return `$${num.toFixed(2)}`;
            };
            
            const formatPercentage = (value: string) => {
              const num = parseFloat(value) * 100;
              return `${num.toFixed(2)}%`;
            };
            
            const positionSummary = `💰 **Your AAVE Position Summary**

📊 **Liquidity & Collateral**
• Total Liquidity: ${formatUsdValue(positionData.totalLiquidityUsd)}
• Total Collateral: ${formatUsdValue(positionData.totalCollateralUsd)}
• Available to Borrow: ${formatUsdValue(positionData.availableBorrowsUsd)}

📈 **Borrowing Status**
• Total Borrowed: ${formatUsdValue(positionData.totalBorrowsUsd)}
• Net Worth: ${formatUsdValue(positionData.netWorthUsd)}

🔒 **Risk Metrics**
• Current LTV: ${formatPercentage(positionData.currentLoanToValue)}
• Liquidation Threshold: ${formatPercentage(positionData.currentLiquidationThreshold)}
• Health Factor: ${positionData.healthFactor}

${parseFloat(positionData.healthFactor) > 2 ? '✅ Your position is healthy!' : parseFloat(positionData.healthFactor) > 1.2 ? '⚠️ Monitor your position closely' : '🚨 Risk of liquidation!'}`;
            
            addMessage('system', positionSummary);
          }
        } else {
          addMessage('assistant', result.data.status.message.parts[0].text);
        }
      } else {
        addMessage('assistant', '🤔 Sorry, I couldn\'t process your request. Could you please try rephrasing it or be more specific about what you\'d like to do?');
      }
    } catch (error) {
      console.error('API Error:', error);
      addMessage('system', '❌ Failed to process your request. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, isConnected, chainId, address, switchChain]);

  const handleTransactionApprove = useCallback(async () => {
    if (!pendingTransaction || currentTxIndex >= pendingTransaction.txPlan.length) {
      return;
    }

    const currentTx = pendingTransaction.txPlan[currentTxIndex];
    
    try {
      const stepType = currentTxIndex === 0 ? 'Approval' : 'Supply';
      addMessage('system', `📝 Sending ${stepType} transaction (${currentTxIndex + 1}/${pendingTransaction.txPlan.length})...\nPlease confirm in your wallet.`);
      
      await sendTransaction(
        {
          to: currentTx.to as `0x${string}`,
          data: currentTx.data as `0x${string}`,
          value: BigInt(currentTx.value || '0'),
        },
        {
          onSuccess: (hash) => {
            setTxHash(hash);
            
            // Move to next transaction or complete
            if (currentTxIndex + 1 < pendingTransaction.txPlan.length) {
              setCurrentTxIndex(currentTxIndex + 1);
              const nextStepType = currentTxIndex + 1 === 0 ? 'Approval' : 'Supply';
              addMessage('system', `✅ ${stepType} transaction sent!\n📤 Hash: ${truncateAddress(hash)}\n⏳ Waiting for confirmation before proceeding to ${nextStepType}...`);
            } else {
              addMessage('system', `✅ Final transaction sent!\n📤 Hash: ${truncateAddress(hash)}\n⏳ Waiting for blockchain confirmation...`);
            }
          },
        }
      );
    } catch (error) {
      console.error('Transaction failed:', error);
      addMessage('system', '❌ Transaction failed. Please try again or check your wallet connection.');
      setPendingTransaction(null);
      setCurrentTxIndex(0);
    }
  }, [pendingTransaction, currentTxIndex, sendTransaction]);

  const handleTransactionReject = useCallback(() => {
    setPendingTransaction(null);
    setCurrentTxIndex(0);
    addMessage('system', '🚫 Transaction cancelled.');
  }, []);

  // --- Render ---
  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10 relative overflow-hidden">
      {/* Connection Status Banner */}
      {(!isConnected || chainId !== arbitrum.id) && (
        <div className={`mx-4 mt-2 mb-2 p-4 rounded-2xl border backdrop-blur-sm ${
          !isConnected 
            ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700'
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700'
        }`}>
          <div className="text-center space-y-3">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                !isConnected 
                  ? 'bg-gradient-to-br from-orange-400 to-red-500' 
                  : 'bg-gradient-to-br from-blue-400 to-indigo-500'
              }`}>
                {!isConnected ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0-4l4-4" />
                  </svg>
                )}
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              {!isConnected ? (
                <>
                  <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200">
                    🔐 Connect Your Wallet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                    Connect your MetaMask wallet to start your DeFi journey on Arbitrum.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    🌐 Switch to Arbitrum
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                    Switch to Arbitrum network in your wallet to use DeFi features.
                  </p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {!isConnected ? (
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center pt-1">
                <Button
                  onClick={() => connect({ connector: connectors[2] })} // MetaMask connector
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                >
                  Connect MetaMask
                </Button>
                <Button
                  onClick={() => connect({ connector: connectors[1] })} // Coinbase Wallet connector
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                >
                  Connect Coinbase
                </Button>
              </div>
            ) : (
              <div className="pt-1">
                <Button
                  onClick={() => switchChain({ chainId: arbitrum.id })}
                  disabled={isChainSwitching}
                  isLoading={isChainSwitching}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                >
                  {isChainSwitching ? 'Switching...' : 'Switch to Arbitrum'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Container - Improved scrolling and visibility */}
      <div className="flex-1 overflow-hidden relative" style={{ 
        marginTop: (!isConnected || chainId !== arbitrum.id) ? '20px' : '0px' 
      }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        </div>
        
        {/* Messages Scroll Area */}
        <div className="h-full overflow-y-auto px-4 py-6 pb-24 space-y-6" style={{ 
          scrollBehavior: 'smooth',
          paddingTop: (!isConnected || chainId !== arbitrum.id) ? '10px' : '24px'
        }}>
          {/* Welcome Message for Empty State */}
          {messages.length <= 1 && (
            <div className="text-center py-8 opacity-60">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-base font-medium">
                Ready to start your DeFi journey!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Transaction Preview */}
          {pendingTransaction && (
            <div className="flex justify-center mb-6 animate-in fade-in duration-300">
              <div className="w-full max-w-2xl">
                <TransactionPreview
                  data={pendingTransaction}
                  onApprove={handleTransactionApprove}
                  onReject={handleTransactionReject}
                  isLoading={isTxPending}
                />
              </div>
            </div>
          )}

          {/* Transaction Success */}
          {txHash && !isTxPending && (
            <div className="flex justify-center mb-6 animate-in slide-in-from-bottom duration-500">
              <div className="w-full max-w-2xl">
                <TransactionSuccess hash={txHash} />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start mb-6 animate-in fade-in duration-200">
              <div className="flex items-end space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-5 py-4 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction errors */}
          {isTxError && (
            <div className="flex justify-center mb-6 animate-in slide-in-from-top duration-300">
              <div className="bg-gradient-to-br from-red-50 via-red-50 to-red-100 dark:from-red-900/20 dark:via-red-900/25 dark:to-red-900/30 border border-red-200 dark:border-red-700/50 rounded-2xl p-6 max-w-2xl w-full shadow-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="font-semibold text-red-800 dark:text-red-200">Transaction Error</span>
                </div>
                <div className="ml-11">
                  {renderError(txError)}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form - Always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isConnected && chainId === arbitrum.id 
                ? "Ask me anything about DeFi... (e.g., 'Supply 0.1 USDC')" 
                : "Connect your wallet first to start trading..."
              }
              disabled={isLoading || !isConnected || chainId !== arbitrum.id}
              className="w-full px-5 py-4 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md transition-all duration-200 text-base font-medium disabled:opacity-50 relative z-10"
              autoComplete="off"
              style={{
                pointerEvents: 'auto',
                cursor: (isLoading || !isConnected || chainId !== arbitrum.id) ? 'not-allowed' : 'text'
              }}
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 z-20"
                style={{ 
                  color: '#6b7280',
                  pointerEvents: 'auto'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || !isConnected || chainId !== arbitrum.id}
            className={`px-6 py-4 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 relative z-10 ${
              !inputValue.trim() || isLoading || !isConnected || chainId !== arbitrum.id
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            }`}
            style={{
              pointerEvents: 'auto',
              minWidth: '100px'
            }}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Sending...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <span className={`text-sm font-medium ${
                  !inputValue.trim() || !isConnected || chainId !== arbitrum.id ? 'text-gray-500' : 'text-white'
                }`}>
                  Send
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}