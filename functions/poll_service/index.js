/* eslint-disable camelcase */
const ISTOffset = 330;

const express = require('express');
const { omit, has, values, find } = require('lodash');
const {
	ZCQL,
	deleteFile,
	deleteRow,
	updateRow,
	insertRow,
	insertRows,
	getRow,
	downloadFile
} = require('./catalystfunctions');
const moment = require('moment');
const catalystSDK = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
	const catalyst = catalystSDK.initialize(req);
	res.locals.catalyst = catalyst;
	next();
});

// Logged Users
app.post('/AllPolls', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const user_id = req.body.user_id;

	let page = parseInt(req.body.page);
	let tempPage = 0;
	let pollCount = 0;
	let poll, pollOption, userPoll, i, query, temp, ended, endedData, votedData;
	let result = {};
	const pollIDs = [];
	let data = [];

	const currentTime = new Date();
	const currentOffset = currentTime.getTimezoneOffset();
	const ISTTime = new Date(
		currentTime.getTime() + (ISTOffset + currentOffset) * 60000
	);

	query = 'select count(Polls.ROWID) from Polls;';

	await ZCQL(catalyst, query)
		.then((response) => {
			pollCount = parseInt(response[0].Polls.ROWID);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

	tempPage = Math.ceil(pollCount / 6);
	if (tempPage < page) {
		page -= 1;
	}
	const range = (page - 1) * 6 + 1;

	query = `select Polls.content,Polls.duration,Polls.category,Polls.ROWID,Polls.votes from Polls limit ${
		range > 0 ? range : 1
	},6`;

	data = await ZCQL(catalyst, query).catch((err) => {
		console.log(err);
		res.status(500).send(err);
	});

	for (i = 0; i < data.length; i++) {
		poll = data[i].Polls;
		pollIDs.push(poll.ROWID);
		ended = moment(poll.duration).isBefore(ISTTime);
		votedData = {
			voted: false,
			userVotedTime: 'NIL',
			userVotedPoll: 'NIL',
			userVotedPollVotes: '0'
		};
		endedData = {
			ended,
			maxVotedPoll: '',
			maxVotedPollVotes: ''
		};
		if (ended) {
			temp = await getMaximumPolled(catalyst, poll.ROWID);
			if (temp.status) {
				endedData.maxVotedPoll = temp.data.content;
				endedData.maxVotedPollVotes = temp.data.votes;
			} else {
				res.status(500).send(temp.data);
			}
		}

		result = {
			...result,
			[poll.ROWID]: {
				...omit(poll, 'ROWID'),
				id: poll.ROWID.toString(),
				edited: false,
				...endedData,
				...votedData
			}
		};
	}
	if (pollIDs.length) {
		query = `select PollOptions.content,PollOptions.votes,User_Polls.poll_id,User_Polls.voted_time from PollOptions inner join User_Polls on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = ${user_id} and User_Polls.poll_id in (${pollIDs.join(
			','
		)})`;

		data = await ZCQL(catalyst, query).catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

		for (i = 0; i < data.length; i++) {
			pollOption = data[i].PollOptions;
			userPoll = data[i].User_Polls;
			votedData = {
				voted: true,
				userVotedTime: moment(userPoll.voted_time).format('D MMM YYYY,HH:mm'),
				userVotedPoll: pollOption.content,
				userVotedPollVotes: pollOption.votes
			};

			result[userPoll.poll_id] = {
				...result[userPoll.poll_id],
				...votedData
			};
		}
	}
	res.status(200).send({
		status: true,
		totalPage: tempPage,
		data: values(result),
		currentPage: page
	});
});

app.post('/CheckForPolled', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const zcql = catalyst.zcql();
	const user_id = req.body.user_id;
	const poll_id = req.body.poll_id;
	let query, queryResponse;
	try {
		query = `SELECT User_Polls.ROWID FROM User_Polls WHERE User_Polls.poll_id = '${poll_id}' AND User_Polls.CREATORID = '${user_id}'`;
		queryResponse = await zcql.executeZCQLQuery(query);
		if (queryResponse.length) {
			res.status(400).send({ message: 'Already Voted' });
		} else {
			res.status(200).send({ message: 'Yet to vote' });
		}
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
});
app.post(['/MyVotes', '/AllPolls/Completed'], async (req, res) => {
	const catalyst = res.locals.catalyst;
	const user_id = req.body.user_id;

	let page = parseInt(req.body.page);
	let userPollCount = 0;
	let poll, pollOption, userPoll, query;
	const result = [];
	const currentTime = new Date();
	const currentOffset = currentTime.getTimezoneOffset();
	const ISTTime = new Date(
		currentTime.getTime() + (ISTOffset + currentOffset) * 60000
	);
	query = `select count(User_Polls.ROWID) from User_Polls where User_Polls.CREATORID  = ${user_id}`;

	await ZCQL(catalyst, query)
		.then((response) => {
			userPollCount = parseInt(response[0].User_Polls.ROWID);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

	const tempPage = Math.ceil(userPollCount / 6);
	if (tempPage < page) {
		page -= 1;
	}
	const range = (page - 1) * 6 + 1;

	query = `select Polls.content,Polls.category,Polls.ROWID,Polls.duration,Polls.votes,PollOptions.content,PollOptions.votes,User_Polls.voted_time from Polls inner join User_Polls on Polls.ROWID = User_Polls.poll_id inner join PollOptions on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID =${user_id} limit ${
		range > 0 ? range : 1
	},6`;

	await ZCQL(catalyst, query)
		.then((response) => {
			response.forEach((element) => {
				poll = element.Polls;
				pollOption = element.PollOptions;
				userPoll = element.User_Polls;

				result.push({
					...omit(poll, 'ROWID'),
					id: poll.ROWID.toString(),
					edited: false,
					ended: moment(poll.duration).isBefore(ISTTime),
					maxVotedPoll: '',
					maxVotedPollVotes: '',
					voted: true,
					userVotedTime: moment(userPoll.voted_time).format('D MMM YYYY,HH:mm'),
					userVotedPoll: pollOption.content,
					userVotedPollVotes: pollOption.votes
				});
			});
			res.status(200).send({
				status: true,
				totalPage: tempPage,
				data: result,
				currentPage: page
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.post('/MyPolls', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const user_id = req.body.user_id;

	let page = parseInt(req.body.page);
	let tempPage = 0;
	let pollCount = 0;
	let poll, pollOption, userPoll, query, votedData, endedData, ended;
	let result = {};
	let data = [];
	const pollIDs = [];
	let i, temp;

	query = `select count(Polls.ROWID) from Polls where Polls.CREATORID=${user_id};`;

	const currentTime = new Date();
	const currentOffset = currentTime.getTimezoneOffset();
	const ISTTime = new Date(
		currentTime.getTime() + (ISTOffset + currentOffset) * 60000
	);

	await ZCQL(catalyst, query)
		.then((response) => {
			pollCount = parseInt(response[0].Polls.ROWID);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

	tempPage = Math.ceil(pollCount / 6);
	if (tempPage < page) {
		page -= 1;
	}

	const range = (page - 1) * 6 + 1;

	query = `select Polls.content,Polls.duration,Polls.category,Polls.ROWID,Polls.votes from Polls where Polls.CREATORID =${user_id} limit ${
		range > 0 ? range : 1
	},6`;

	data = await ZCQL(catalyst, query).catch((err) => {
		console.log(err);
		res.status(500).send(err);
	});

	for (i = 0; i < data.length; i++) {
		poll = data[i].Polls;
		pollIDs.push(poll.ROWID);
		ended = moment(poll.duration).isBefore(ISTTime);
		votedData = {
			voted: false,
			userVotedTime: '',
			userVotedPoll: 'NIL',
			userVotedPollVotes: ''
		};
		endedData = {
			ended,
			maxVotedPoll: '',
			maxVotedPollVotes: ''
		};
		if (ended) {
			temp = await getMaximumPolled(catalyst, poll.ROWID);
			if (temp.status) {
				endedData.maxVotedPoll = temp.data.content;
				endedData.maxVotedPollVotes = temp.data.votes;
			} else {
				res.status(500).send(temp.data);
			}
		}

		result = {
			...result,
			[poll.ROWID]: {
				...omit(poll, 'ROWID'),
				id: poll.ROWID.toString(),
				edited: true,
				...endedData,
				...votedData
			}
		};
	}
	if (pollIDs.length) {
		query = `select PollOptions.content,PollOptions.votes,User_Polls.poll_id,User_Polls.voted_time from PollOptions inner join User_Polls on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = ${user_id} and User_Polls.poll_id in (${pollIDs.join(
			','
		)})`;

		data = await ZCQL(catalyst, query).catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

		for (i = 0; i < data.length; i++) {
			pollOption = data[i].PollOptions;
			userPoll = data[i].User_Polls;
			temp = {
				voted: true,
				userVotedTime: userPoll.voted_time,
				userVotedPoll: pollOption.content,
				userVotedPollVotes: pollOption.votes
			};

			result[userPoll.poll_id] = {
				...result[userPoll.poll_id],
				...temp
			};
		}
	}
	res.status(200).send({
		status: true,
		totalPage: tempPage,
		data: values(result),
		currentPage: page
	});
});

app.post('/MyPolls/Ended', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const user_id = req.body.user_id;
	let page = parseInt(req.body.page);
	let tempPage = 0;
	let pollCount = 0;
	let count = 1;
	let poll, pollOption, userPoll, query, votedData, endedData, ended;
	let result = {};
	let data = [];
	const pollIDs = [];
	let i, temp;
	const currentTime = new Date();
	const currentOffset = currentTime.getTimezoneOffset();
	const ISTTime = new Date(
		currentTime.getTime() + (ISTOffset + currentOffset) * 60000
	);

	query = `select count(Polls.ROWID) from Polls where Polls.CREATORID=${user_id} and Polls.duration <= '${moment(
		ISTTime
	).format('YYYY-MM-DD HH:mm:ss')}'`;

	await ZCQL(catalyst, query)
		.then((response) => {
			pollCount = parseInt(response[0].Polls.ROWID);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

	tempPage = Math.ceil(pollCount / 6);
	if (tempPage < page) {
		page -= 1;
	}

	const range = (page - 1) * 6 + 1;

	query = `select Polls.content,Polls.duration,Polls.category,Polls.ROWID,Polls.votes from Polls where Polls.CREATORID =${user_id} and Polls.duration <= '${moment(
		ISTTime
	).format('YYYY-MM-DD HH:mm:ss')}' limit ${range > 0 ? range : 1},6`;

	data = await ZCQL(catalyst, query).catch((err) => {
		console.log(err);
		res.status(500).send(err);
	});
	for (i = 0; i < data.length; i++, count++) {
		poll = data[i].Polls;
		pollIDs.push(poll.ROWID);
		ended = true;
		votedData = {
			voted: false,
			userVotedTime: '',
			userVotedPoll: 'NIL',
			userVotedPollVotes: ''
		};
		endedData = {
			ended,
			maxVotedPoll: '',
			maxVotedPollVotes: ''
		};

		temp = await getMaximumPolled(catalyst, poll.ROWID);
		if (temp.status) {
			endedData.maxVotedPoll = temp.data.content;
			endedData.maxVotedPollVotes = temp.data.votes;
		} else {
			res.status(500).send(temp.data);
		}
		result = {
			...result,
			[poll.ROWID]: {
				...omit(poll, 'ROWID'),
				id: poll.ROWID.toString(),
				edited: true,
				...endedData,
				...votedData
			}
		};
	}
	if (pollIDs.length) {
		query = `select PollOptions.content,PollOptions.votes,User_Polls.poll_id,User_Polls.voted_time from PollOptions inner join User_Polls on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = ${user_id} and User_Polls.poll_id in (${pollIDs.join(
			','
		)})`;

		data = await ZCQL(catalyst, query).catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

		for (i = 0; i < data.length; i++) {
			pollOption = data[i].PollOptions;
			userPoll = data[i].User_Polls;
			temp = {
				voted: true,
				userVotedTime: userPoll.voted_time,
				userVotedPoll: pollOption.content,
				userVotedPollVotes: pollOption.votes
			};

			result[userPoll.poll_id] = {
				...result[userPoll.poll_id],
				...temp
			};
		}
	}

	res.status(200).send({
		status: true,
		totalPage: tempPage,
		data: values(result),
		currentPage: page
	});
});

app.post('/deletePoll', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const filestore = catalyst.filestore();
	const poll_id = req.body.id;
	let i;
	let Promises = [];
	const fileId = [];
	let query = '';
	const allFolders = await filestore.getAllFolders();
	let FOLDER_ID = '';
	allFolders.forEach((item) => {
		item = JSON.parse(item);
		if (item.folder_name === 'Images') {
			FOLDER_ID = item.id;
		}
	});
	query = `SELECT Polls.file_id from Polls where Polls.ROWID = ${poll_id}`;
	ZCQL(catalyst, query)
		.then((response) => {
			if (response.length) {
				if (response[0].Polls.file_id) {
					fileId.push(response[0].Polls.file_id);
				}
			} else {
				res.status(500).send({
					status: false,
					message: 'No data Found'
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

	query = `SELECT PollOptions.file_id from PollOptions where PollOptions.poll_id = ${poll_id}`;

	Promises.push(
		ZCQL(catalyst, query)
			.then((response) => {
				response.forEach((element) => {
					if (element.PollOptions.file_id) {
						fileId.push(element.PollOptions.file_id);
					}
				});
			})
			.catch((err) => {
				console.log(err);
				res.status(500).send(err);
			})
	);

	await Promise.all(Promises);

	Promises = [];
	if (fileId.length) {
		for (i = 0; i < fileId.length; i++) {
			Promises.push(
				deleteFile(catalyst, FOLDER_ID, fileId[i]).catch((err) => {
					console.log(err);
					res.status(500).send(err);
				})
			);
		}
	}
	Promises.push(
		deleteRow(catalyst, 'Polls', poll_id).catch((err) => {
			console.log(err);
			res.status(500).send(err);
		})
	);

	await Promise.all(Promises);
	res.status(200).send({
		status: true
	});
});

app.post('/updatePoll', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const poll_id = req.body.id;
	const duration = req.body.duration;
	const query = `SELECT Polls.ROWID from Polls where Polls.ROWID = ${poll_id}`;
	const updateData = {
		ROWID: poll_id,
		duration
	};

	ZCQL(catalyst, query)
		.then((response) => {
			if (response.length) {
				updateRow(catalyst, 'Polls', updateData)
					.then(() => {
						res.status(200).send({
							status: true
						});
					})
					.catch((err) => {
						console.log(err);
						res.status(500).send(err);
					});
			} else {
				res.status(500).send({
					status: false,
					message: 'No data Found'
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.post('/pollDetails', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const poll_id = req.body.id;
	const user_id = req.body.user_id;

	let result = {};
	let poll, pollOptions, query;

	query = `select Polls.content,Polls.file_id,Polls.votes,Polls.category,PollOptions.content,PollOptions.file_id,PollOptions.votes from Polls inner join PollOptions on PollOptions.poll_id =  Polls.ROWID where Polls.ROWID = '${poll_id}' ORDER BY PollOptions.votes DESC`;

	await ZCQL(catalyst, query)
		.then((response) => {
			if (response.length) {
				response.forEach((element) => {
					poll = element.Polls;
					pollOptions = element.PollOptions;
					if (has(result, 'content')) {
						result.options.push(pollOptions);
					} else {
						result = {
							...poll,
							options: [{ ...pollOptions }]
						};
					}
				});
			} else {
				res.status(500).send({
					status: false,
					message: 'No data Found'
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
	if (user_id) {
		query = `select PollOptions.content from PollOptions inner join User_Polls on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = '${user_id}' and User_Polls.poll_id = '${poll_id}'`;

		await ZCQL(catalyst, query)
			.then((response) => {
				if (response.length) {
					result = {
						...result,
						userVotedPoll: response[0].PollOptions.content
					};
				} else {
					result = {
						...result,
						userVotedPoll: 'NIL'
					};
				}
			})
			.catch((err) => {
				console.log(err);
				res.status(500).send(err);
			});
	}

	res.status(200).send({
		status: true,
		data: result
	});
});

app.post('/savePoll', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const data = req.body;
	let result = {};
	const resultPollOptions = [];
	const insertPollData = data.insertPollData;
	const insertPollOptionsData = data.insertPollOptionsData;
	await insertRow(catalyst, 'Polls', insertPollData)
		.then((response) => {
			result = {
				id: response.ROWID,
				content: response.content,
				duration: response.duration,
				file_id: response.file_id ? response.file_id : '',
				category: response.category,
				created_by: response.created_by
			};
			insertPollOptionsData.forEach((element) => {
				element.poll_id = response.ROWID;
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

	await insertRows(catalyst, 'PollOptions', insertPollOptionsData)
		.then((response) => {
			response.forEach((element) => {
				resultPollOptions.push({
					id: element.ROWID.toString(),
					content: element.content,
					file_id: element.file_id ? element.file_id : ''
				});
			});
			res.status(200).send({
				status: true,
				data: {
					...result,
					options: resultPollOptions
				}
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.post('/getPoll', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const poll_id = req.body.id;
	let poll;
	let pollOption;
	let result = {};

	const query = `select Polls.content,Polls.duration,Polls.category,Polls.created_by,Polls.file_id,PollOptions.content,PollOptions.file_id,PollOptions.ROWID from Polls inner join PollOptions on Polls.ROWID = PollOptions.poll_id where Polls.ROWID = '${poll_id}'`;

	ZCQL(catalyst, query)
		.then((response) => {
			if (response.length) {
				response.forEach((element) => {
					poll = element.Polls;
					pollOption = element.PollOptions;
					if (has(result, 'content')) {
						result.options.push({
							id: pollOption.ROWID.toString(),
							content: pollOption.content,
							file_id: pollOption.file_id
						});
					} else {
						result = {
							id: poll_id,
							...poll,
							options: [
								{
									id: pollOption.ROWID.toString(),
									content: pollOption.content,
									file_id: pollOption.file_id
								}
							]
						};
					}
				});
				res.status(200).send({
					status: true,
					data: {
						...result
					}
				});
			} else {
				res.status(500).send({
					status: false,
					message: 'No data Found'
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.post('/saveVote', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const poll_id = req.body.poll_id;
	const poll_option_id = req.body.poll_option_id;
	const user_id = req.body.user_id;
	let query;
	let poll;
	let pollOptions;
	let result = {};
	let Promises = [];
	let votes;
	let particularPollVote;

	query = `SELECT Polls.ROWID from Polls where Polls.ROWID = ${poll_id}`;
	ZCQL(catalyst, query)
		.then((response) => {
			if (!response.length) {
				res.status(500).send({
					status: false,
					message: 'No data Found'
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
	const currentTime = new Date();
	const currentOffset = currentTime.getTimezoneOffset();
	const ISTTime = new Date(
		currentTime.getTime() + (ISTOffset + currentOffset) * 60000
	);

	const userPollInserData = {
		poll_id,
		poll_option_id,
		voted_time: moment(ISTTime).format('YYYY-MM-DD HH:mm:ss')
	};

	Promises.push(
		getRow(catalyst, 'Polls', poll_id)
			.then((response) => {
				console.log(response);
				votes = parseInt(response.votes);
			})
			.catch((err) => {
				console.log(err);
				res.status(500).send(err);
			})
	);

	Promises.push(
		getRow(catalyst, 'PollOptions', poll_option_id)
			.then((response) => {
				particularPollVote = parseInt(response.votes);
			})
			.catch((err) => {
				console.log(err);
				res.status(500).send(err);
			})
	);

	await Promise.all(Promises);
	particularPollVote += 1;
	votes += 1;

	const updatePollData = {
		ROWID: poll_id,
		votes
	};

	const updatePollOptionData = {
		ROWID: poll_option_id,
		votes: particularPollVote
	};

	Promises = [];
	Promises.push(
		insertRow(catalyst, 'User_Polls', userPollInserData).catch((err) => {
			console.log(err);
			res.status(500).send(err);
		})
	);

	Promises.push(
		updateRow(catalyst, 'Polls', updatePollData).catch((err) => {
			console.log(err);
			res.status(500).send(err);
		})
	);

	Promises.push(
		updateRow(catalyst, 'PollOptions', updatePollOptionData).catch((err) => {
			console.log(err);
			res.status(500).send(err);
		})
	);

	await Promise.all(Promises);

	if (user_id) {
		query = `select Polls.content,Polls.file_id,Polls.votes,Polls.category,PollOptions.content,PollOptions.file_id,PollOptions.votes from Polls inner join PollOptions on PollOptions.poll_id =  Polls.ROWID where Polls.ROWID = '${poll_id}' ORDER BY PollOptions.votes DESC`;

		await ZCQL(catalyst, query)
			.then((response) => {
				if (response.length) {
					response.forEach((element) => {
						poll = element.Polls;
						pollOptions = element.PollOptions;
						if (has(result, 'content')) {
							result.options.push(pollOptions);
						} else {
							result = {
								...poll,
								options: [{ ...pollOptions }]
							};
						}
					});
				}
			})
			.catch((err) => {
				console.log(err);
				res.status(500).send(err);
			});

		query = `select PollOptions.content from PollOptions inner join User_Polls on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = '${user_id}' and User_Polls.poll_id = '${poll_id}'`;

		await ZCQL(catalyst, query)
			.then((response) => {
				if (response.length) {
					result = {
						...result,
						userVotedPoll: response[0].PollOptions.content
					};
				} else {
					result = {
						...result,
						userVotedPoll: 'NIL'
					};
				}
			})
			.catch((err) => {
				console.log(err);
				res.status(500).send(err);
			});

		res.status(200).send({
			status: true,
			data: result
		});
	} else {
		res.status(200).send({
			status: true
		});
	}
});

// Guest users

app.get('/AllPolls/:page', async (req, res) => {
	const catalyst = res.locals.catalyst;
	let page = parseInt(req.params.page);
	let tempPage = 0;
	let pollCount = 0;
	let query;
	let i, polls, ended;
	const result = [];
	let data;
	let temp;

	query = 'select count(Polls.ROWID) from Polls;';

	await ZCQL(catalyst, query)
		.then((response) => {
			pollCount = parseInt(response[0].Polls.ROWID);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

	tempPage = Math.ceil(pollCount / 6);
	if (tempPage < page) {
		page -= 1;
	}

	const range = (page - 1) * 6 + 1;

	query = `select Polls.content,Polls.duration,Polls.category,Polls.ROWID,Polls.votes from Polls limit ${
		range > 0 ? range : 0
	},6`;

	const currentTime = new Date();
	const currentOffset = currentTime.getTimezoneOffset();
	const ISTOffset = 330;
	const ISTTime = new Date(
		currentTime.getTime() + (ISTOffset + currentOffset) * 60000
	);

	await ZCQL(catalyst, query)
		.then((response) => {
			data = response;
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});

	for (i = 0; i < data.length; i++) {
		polls = data[i].Polls;
		ended = moment(polls.duration).isBefore(ISTTime);
		if (ended) {
			temp = await getMaximumPolled(catalyst, polls.ROWID);
			if (temp.status) {
				result.push({
					...omit(polls, 'ROWID'),
					id: polls.ROWID.toString(),
					ended,
					maxVotedPoll: temp.data.content,
					maxVotedPollVotes: temp.data.votes
				});
			}
		} else {
			result.push({
				...omit(polls, 'ROWID'),
				id: polls.ROWID.toString(),
				ended
			});
		}
	}

	res.status(200).send({
		status: true,
		totalPage: tempPage,
		data: result,
		currentPage: page
	});
});
app.get('/FOLDER_ID', async (req, res) => {
	try {
		const catalyst = res.locals.catalyst;
		const filestore = catalyst.filestore();
		const allFolders = await filestore.getAllFolders();
		let FOLDER_ID = '';

		allFolders.forEach((item) => {
			item = JSON.parse(item);
			if (item.folder_name === 'Images') {
				FOLDER_ID = item.id;
			}
		});
		res.status(200).send({
			FOLDER_ID
		});
	} catch (error) {
		console.log(error);
		res.status(500).send(err);
	}
});
app.get('/imageLoader/:file_id', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const file_id = req.params.file_id;
	const filestore = catalyst.filestore();
	const allFolders = await filestore.getAllFolders();
	let FOLDER_ID = '';
	allFolders.forEach((item) => {
		item = JSON.parse(item);
		if (item.folder_name === 'Images') {
			FOLDER_ID = item.id;
		}
	});
	downloadFile(catalyst, FOLDER_ID, file_id)
		.then((response) => {
			res.contentType('png').status(200).send(response);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.post('/register', async (req, res) => {
	const catalyst = res.locals.catalyst;
	const userManagement = catalyst.userManagement();
	const data = req.body;
	const zaid = req.headers['x-zc-project-key'];
	
	const signupConfig = {
		platform_type: 'web',
		zaid
	};
	const userConfig = {
		...data
	};

	try {
		const allUsers = await userManagement.getAllUsers();
		const userExists = find(allUsers, ['email_id', data.email_id]);
		if (userExists) {
			res.status(400).send({
				message: 'User Already Exists'
			});
			return;
		}
		await userManagement.registerUser(signupConfig, userConfig);
		res.status(200).send({
			status: true
		});
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
});

module.exports = app;

async function getMaximumPolled(catalyst, poll_id) {
	const maxQuery = `select max(PollOptions.votes) from PollOptions where PollOptions.poll_id =${poll_id};`;
	let maxVotes = '';
	let error = '';
	let errorFlag = false;
	let query = '';
	let data = {};

	await ZCQL(catalyst, maxQuery)
		.then((response) => {
			maxVotes = parseInt(response[0].PollOptions['MAX(votes)']);
		})
		.catch((err) => {
			errorFlag = true;
			error = err;
		});
	if (!errorFlag) {
		query = `select PollOptions.content,PollOptions.votes from PollOptions where PollOptions.poll_id = ${poll_id} and PollOptions.votes  = ${maxVotes}`;
		await ZCQL(catalyst, query)
			.then((response) => {
				data = response[0].PollOptions;
			})
			.catch((err) => {
				errorFlag = true;
				error = err;
			});

		if (!errorFlag) {
			return {
				status: true,
				data
			};
		} else {
			return {
				status: false,
				data: error
			};
		}
	} else {
		return {
			status: false,
			data: error
		};
	}
}
