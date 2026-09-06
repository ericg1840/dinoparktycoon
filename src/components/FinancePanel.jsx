import { useState } from 'react'

export default function FinancePanel({
  cash,
  loan,
  reputation,
  cleanliness,
  ticketPrice,
  lastVisitors,
  lastRevenue,
  onSetTicketPrice,
  onPayLoan,
  lastQuarterReport,
}) {
  const [payAmount, setPayAmount] = useState(500)

  return (
    <div className="panel finance-panel">
      <h2>Finances</h2>
      <div className="finance-stats">
        <div>
          <span className="label">Cash</span>
          <span className={`value ${cash < 0 ? 'negative' : ''}`}>${cash.toLocaleString()}</span>
        </div>
        <div>
          <span className="label">Loan Balance</span>
          <span className="value">${loan.toLocaleString()}</span>
        </div>
        <div>
          <span className="label">Reputation</span>
          <span className="value">{Math.round(reputation)}</span>
        </div>
        <div>
          <span className="label">Cleanliness</span>
          <span className="value">{Math.round(cleanliness)}%</span>
        </div>
        <div>
          <span className="label">Visitors (last day)</span>
          <span className="value">{lastVisitors}</span>
        </div>
        <div>
          <span className="label">Revenue (last day)</span>
          <span className="value">${lastRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div className="ticket-price-control">
        <label htmlFor="ticket-price">Ticket Price: ${ticketPrice}</label>
        <input
          id="ticket-price"
          type="range"
          min="1"
          max="60"
          value={ticketPrice}
          onChange={(e) => onSetTicketPrice(Number(e.target.value))}
        />
      </div>

      <div className="loan-control">
        <input
          type="number"
          min="0"
          max={Math.min(cash, loan)}
          value={payAmount}
          onChange={(e) => setPayAmount(Number(e.target.value))}
        />
        <button
          className="secondary small"
          disabled={loan <= 0 || cash <= 0}
          onClick={() => onPayLoan(payAmount)}
        >
          Pay Loan
        </button>
      </div>

      {lastQuarterReport && (
        <div className="quarterly-report">
          <h3>
            Quarterly Report — Y{lastQuarterReport.year} Q{lastQuarterReport.quarter}
          </h3>
          <table>
            <tbody>
              <tr>
                <td>Ticket Revenue</td>
                <td>${Math.round(lastQuarterReport.breakdown.ticketRevenue).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Staff Costs</td>
                <td>-${Math.round(lastQuarterReport.breakdown.staffCost).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Loan Interest</td>
                <td>-${Math.round(lastQuarterReport.breakdown.interestCost).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Incident Costs</td>
                <td>-${Math.round(lastQuarterReport.breakdown.incidentCost).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Capital Spending</td>
                <td>-${Math.round(lastQuarterReport.breakdown.capitalSpend).toLocaleString()}</td>
              </tr>
              <tr className="total-row">
                <td>Net Profit</td>
                <td className={lastQuarterReport.profit < 0 ? 'negative' : ''}>
                  ${Math.round(lastQuarterReport.profit).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="hint">Total visitors this quarter: {lastQuarterReport.breakdown.visitorTotal.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
