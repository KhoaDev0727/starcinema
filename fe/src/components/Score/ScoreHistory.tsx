import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Score.scss';

interface ScoreHistoryDTO {
	scoreId: string;
	userId: number;
	ticketId: string;
	points: number;
	transactionDate: string;
	type: string;
}

const PAGE_SIZE = 10;

const ScoreHistory: React.FC = () => {
	const [history, setHistory] = useState<ScoreHistoryDTO[]>([]);
	const [type, setType] = useState<string>('');
	const [page, setPage] = useState<number>(0);
	const [total, setTotal] = useState<number>(0);
	const userId = Number(localStorage.getItem('userId'));

	useEffect(() => {
		if (!userId) return;
		axios
			.get('http://localhost:8080/api/scores/history', {
				params: { userId, type, page, size: PAGE_SIZE }
			})
			.then(res => {
				setHistory(res.data.content);
				setTotal(res.data.totalElements);
			});
	}, [userId, type, page]);

	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setType(e.target.value);
		setPage(0);
	};

	return (
		<div className="score-history-wrapper">
			<div className="score-history-header-row">
				<div className="score-history-header">Score History</div>
				<div className="score-history-controls">
					<label htmlFor="type-filter">Filter by Type:</label>
					<select value={type} onChange={handleTypeChange}>
						<option value="">All</option>
						<option value="add">Added</option>
						<option value="use">Used</option>
					</select>
				</div>
			</div>
			<table className="score-history-table">
				<thead>
					<tr>
						<th>Date</th>
						<th>Type</th>
						<th>Points</th>
						<th>Ticket/Booking ID</th>
					</tr>
				</thead>
				<tbody>
					{history.length === 0 ? (
						<tr className="score-history-empty-row">
							<td colSpan={4}>No score history found.</td>
						</tr>
					) : (
						history.map(h => (
							<tr key={h.scoreId}>
								<td>{new Date(h.transactionDate).toLocaleString()}</td>
								<td>{h.type === 'add' ? 'Added' : 'Used'}</td>
								<td>{h.points > 0 ? `+${h.points}` : h.points}</td>
								<td>{h.ticketId ?? '-'}</td>
							</tr>
						))
					)}
				</tbody>
			</table>
			<div className="score-history-pagination">
				<button onClick={() => setPage(page - 1)} disabled={page === 0}>&lt;</button>
				<span> {page + 1} / {Math.ceil(total / PAGE_SIZE) || 1}</span>
				<button onClick={() => setPage(page + 1)} disabled={(page + 1) * PAGE_SIZE >= total}>&gt;</button>
			</div>
		</div>
	);
};
export default ScoreHistory;
