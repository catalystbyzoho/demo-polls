var intervalID = '';
var currentPage = 1;
window.onload = async () => {
	document
		.querySelector('meta[property="twitter:image"]')
		.setAttribute('content', `https://${document.domain}/app/images/Polls.png`);
	displayContent();
};

function displayContent() {
	let hash = window.location.hash;
	if (hash.includes('login')) {
		loadLoginPage();
	} else if (hash.includes('signup')) {
		loadSignUpPage();
	} else if (hash.includes('vote')) {
		checkForAuthentication(hash.substr(hash.indexOf('/') + 1));
	} else if (hash.includes('view')) {
		getPollDetails(hash.substr(hash.indexOf('/') + 1));
	} else {
		loadAllPolls(1);
	}
}
window.addEventListener('hashchange', function () {
	displayContent();
});
function checkForAuthentication(poll_id) {
	catalyst.auth
		.isUserAuthenticated()
		.then((result) => {
			var settings = {
				url: `/server/poll_service/CheckForPolled`,
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				data: JSON.stringify({
					poll_id,
					user_id: result.content.user_id.toString()
				})
			};

			$.ajax(settings)
				.then(function () {
					getPollVoteData(poll_id);
				})
				.catch(function (error) {
					if (error.status === 400) {
						window.location.href = `#view/${poll_id}`;
					} else {
						console.log(error);
					}
				});
		})
		.catch((err) => {
			getPollVoteData(poll_id);
		});
}

function generateVoteCard(data) {
	let categorySpan, votesSpan, headerDiv;
	let contentLabel,
		durationLabel,
		voteButton,
		childDiv,
		parentDiv,
		loaderComponent,
		buttonLoaderDiv,
		timeSpan;

	categorySpan = document.createElement('span');
	categorySpan.setAttribute('class', 'poll-dash-tags poll-dash-tags-ctgry');
	categorySpan.innerText = data.category;

	votesSpan = document.createElement('span');
	votesSpan.setAttribute('class', 'poll-dash-tags poll-dash-tags-votes');
	votesSpan.innerText = data.votes + ' Votes';

	headerDiv = document.createElement('div');
	headerDiv.setAttribute('class', 'mB10');
	headerDiv.appendChild(categorySpan);
	headerDiv.appendChild(votesSpan);

	contentLabel = document.createElement('h4');
	contentLabel.setAttribute('class', 'poll-dash-header');
	contentLabel.innerText = data.content;

	timeSpan = document.createElement('span');
	timeSpan.setAttribute('name', 'time');
	timeSpan.setAttribute('index', data.id);
	timeSpan.setAttribute('duration', data.duration);
	timeSpan.setAttribute('id', `time_${data.id}`);
	timeSpan.innerText = calculateDifferenceBetweenDates(
		data.duration
	).formattedDate;

	durationLabel = document.createElement('h6');
	durationLabel.setAttribute('class', 'poll-dash-timer');
	durationLabel.innerText = 'ENDS IN: ';
	durationLabel.appendChild(timeSpan);

	voteButton = document.createElement('a');
	voteButton.setAttribute('class', 'pollapp-button button-primary-hollow');
	voteButton.setAttribute('id', data.id);
	voteButton.innerText = 'Vote Now';
	voteButton.href = `#vote/${data.id}`;

	loaderComponent = loader('22px', 'none', true, false, data.id);

	buttonLoaderDiv = document.createElement('div');
	buttonLoaderDiv.style.display = 'flex';
	buttonLoaderDiv.appendChild(voteButton);
	buttonLoaderDiv.appendChild(loaderComponent);

	childDiv = document.createElement('div');
	childDiv.appendChild(headerDiv);
	childDiv.setAttribute('class', 'poll-dashboard');
	childDiv.appendChild(contentLabel);
	childDiv.appendChild(durationLabel);
	childDiv.appendChild(buttonLoaderDiv);

	parentDiv = document.createElement('div');
	parentDiv.setAttribute('class', 'col-lg-4 col-md-6 remove-padding');
	parentDiv.appendChild(childDiv);

	return parentDiv;
}

function realTimeTimer() {
	let timeDivs = document.getElementsByName('time');
	let i,
		poll_id,
		date,
		temp,
		endedContainer,
		endedContent,
		homeButton,
		resultButton,
		footer;
	let hash = window.location.hash;
	for (i = 0; i < timeDivs.length; i++) {
		poll_id = timeDivs[i].getAttribute('index');
		date = timeDivs[i].getAttribute('duration');
		temp = calculateDifferenceBetweenDates(date);
		document.getElementById(`time_${poll_id}`).innerText = temp.formattedDate;
		if (!hash && !temp.days && !temp.hours && !temp.minutes && !temp.seconds) {
			loadAllPolls();
			break;
		} else if (
			hash.includes('vote') &&
			!temp.days &&
			!temp.hours &&
			!temp.minutes &&
			!temp.seconds
		) {
			endedContainer = document.createElement('div');
			endedContainer.setAttribute('class', 'alignCenter ended-poll');

			endedContent = document.createElement('h3');
			endedContent.innerText = 'Poll has been ended';

			homeButton = document.createElement('a');
			homeButton.setAttribute('class', 'pollapp-button button-secondary mR30');
			homeButton.innerText = 'Home';
			homeButton.href = '/';

			resultButton = document.createElement('a');
			resultButton.setAttribute('class', 'pollapp-button button-primary');
			resultButton.innerText = 'View Result';
			resultButton.href = `#view/${data.id}`;

			footer = document.createElement('div');
			footer.setAttribute('class', 'mT40 d-flex');
			footer.appendChild(homeButton);
			footer.appendChild(resultButton);

			endedContainer.appendChild(endedContent);
			endedContainer.appendChild(footer);
			$('#displayContent').html(endedContainer);
		}
	}
}

function loadAllPolls() {
	let parentDiv = document.createElement('div');
	parentDiv.setAttribute('class', 'container mT30');

	let headerDiv = document.createElement('div');
	headerDiv.setAttribute('class', 'guest-banner');

	let loginSignUpDiv = document.createElement('div');
	loginSignUpDiv.setAttribute('class', 'row');

	let innerDiv = document.createElement('div');
	innerDiv.setAttribute('class', 'col-lg-6 col-sm-12');

	let temp = document.createElement('h2');
	temp.innerText =
		'Create instant, real-time polls and share them with the world';
	innerDiv.appendChild(temp);

	temp = document.createElement('p');
	temp.innerText = 'Signup for free and start creating polls instantly.';
	innerDiv.appendChild(temp);

	let login = document.createElement('a');
	login.setAttribute('class', 'pollapp-button');
	login.innerText = 'Login';
	login.href = '#login';
	login.style.color = 'white';
	login.style.backgroundColor = 'inherit';
	login.style.border = '1px solid white';
	login.style.marginRight = '10px';

	let signUp = document.createElement('a');
	signUp.setAttribute('class', 'pollapp-button button-primary-white');
	signUp.href = '#signup';
	signUp.innerText = 'Sign Up';
	innerDiv.appendChild(login);
	innerDiv.appendChild(signUp);

	loginSignUpDiv.appendChild(innerDiv);
	headerDiv.appendChild(loginSignUpDiv);

	let allPollsHeaderDiv = document.createElement('div');
	allPollsHeaderDiv.setAttribute('class', 'row');

	let allPollsInnerDiv = document.createElement('div');
	allPollsInnerDiv.setAttribute('class', 'col-lg-5 col-sm-12 guest-head-desc');

	let allPollsTitle = document.createElement('h3');
	allPollsTitle.innerText = 'All Polls';

	let pollsDiv = document.createElement('div');
	pollsDiv.setAttribute('class', 'row');
	pollsDiv.setAttribute('id', 'polls');

	let paginationDiv = document.createElement('div');
	paginationDiv.setAttribute('id', 'pagination');

	allPollsInnerDiv.appendChild(allPollsTitle);
	allPollsHeaderDiv.appendChild(allPollsInnerDiv);

	parentDiv.appendChild(headerDiv);
	parentDiv.appendChild(allPollsHeaderDiv);
	parentDiv.appendChild(pollsDiv);
	parentDiv.appendChild(paginationDiv);

	$('#displayContent').html(parentDiv);
	generateCards();
}

// Difference calculator
function calculateDifferenceBetweenDates(date) {
	let endDate = moment(date);
	let temp = endDate.diff(moment(), 'days');
	let days = temp > 0 ? temp : 0;
	endDate = endDate.subtract(days, 'days');
	temp = endDate.diff(moment(), 'hours');
	let hours = temp > 0 ? temp : 0;
	endDate = endDate.subtract(hours, 'hours');
	temp = endDate.diff(moment(), 'minutes');
	let minutes = temp > 0 ? temp : 0;
	endDate = endDate.subtract(minutes, 'minutes');
	temp = endDate.diff(moment(), 'seconds');
	let seconds = temp > 0 ? temp : 0;

	return {
		formattedDate: `${days.toLocaleString('en-US', {
			minimumIntegerDigits: 2,
			useGrouping: false
		})}D : ${hours.toLocaleString('en-US', {
			minimumIntegerDigits: 2,
			useGrouping: false
		})}H: ${minutes.toLocaleString('en-US', {
			minimumIntegerDigits: 2,
			useGrouping: false
		})}M: ${seconds.toLocaleString('en-US', {
			minimumIntegerDigits: 2,
			useGrouping: false
		})}`,
		seconds,
		hours,
		days,
		minutes
	};
}

function generateCards() {
	let status = false,
		i,
		data = [],
		totalPage,
		elements = [];
	$('#polls').html(loader('3rem', 'block', false, true, false, false, true));
	var settings = {
		url: `/server/poll_service/AllPolls/${currentPage}`,
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	};

	// var settings = {
	//     "url": `/server/poll_service_java/AllPolls/${page}`,
	//     "method": "GET",
	//     "headers": {
	//         "content-type": "application/json",
	//     },
	// }

	$.ajax(settings)
		.then(function (response) {
			// response = JSON.parse(response);
			status = response.status;
			data = response.data;
			totalPage = response.totalPage;
			currentPage = response.currentPage;
			if (status) {
				for (i = 0; i < data.length; i++) {
					if (!data[i].ended) {
						elements.push(generateVoteCard(data[i]));
					} else {
						elements.push(loadEndedCard(data[i]));
					}
				}
				if (!data.length) {
					elements.push(
						showNoPolls(`No <span class="pollColor">Polls</span> Available `)
					);
				}
				loadPagination(totalPage, currentPage);
				$('#polls').html(elements);
				setInterval(() => {
					realTimeTimer();
				}, 1000);
			}
		})
		.catch((err) => {
			console.log(err);
			alert('Internal Server Error Alert Occured');
		});
}

function getPollVoteData(poll_id) {
	let status = false;
	$(`#${poll_id}`).attr('disabled', true);
	$(`#loader_${poll_id}`).css('display', 'block');
	let data = {};
	var settings = {
		url: '/server/poll_service/getPoll',
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		data: JSON.stringify({
			id: poll_id
		})
	};
	// var settings = {

	//     "url": "/server/poll_service_java/getPoll",
	//     "method": "POST",
	//     "headers": {
	//         "content-type": "application/json",
	//     },
	//     "data": JSON.stringify({
	//         id
	//     })
	// }

	$.ajax(settings)
		.then(function (response) {
			// response = JSON.parse(response);
			status = response.status;
			data = response.data;
			if (status) {
				loadVotePage(data);
				clearInterval(intervalID);
				intervalId = setInterval(() => {
					realTimeTimer();
				}, 1000);
			}
		})
		.catch((err) => {
			console.log(err);
			alert('Internal Server Error Alert Occured');
		});
}

async function saveVote(element) {
	let poll_id = element.getAttribute('index');
	let pollOptions = document.getElementsByName('pollOption');
	let i,
		status = false,
		data = {};
	let poll_option_id = '';
	for (i = 0; i < pollOptions.length; i++) {
		if (pollOptions[i].checked) {
			poll_option_id = pollOptions[i].value;
		}
	}

	if (poll_option_id) {
		element.disabled = true;
		$('#loader_vote').css('display', 'block');
		var settings = {
			url: '/server/poll_service/saveVote',
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},

			data: JSON.stringify({
				poll_id,
				poll_option_id
			})
		};

		// var settings = {

		//     "url": "/server/poll_service_java/saveVote",
		//     "method": "POST",
		//     "headers": {
		//         "content-type": "application/json",
		//     },

		//     "data": JSON.stringify({
		//         poll_id,
		//         poll_option_id,
		//     })
		// }

		$.ajax(settings)
			.then(function (response) {
				// response = JSON.parse(response);
				status = response.status;
				data = response.data;
				if (status) {
					window.location.hash = `#view/${poll_id}`;
				}
			})
			.catch((err) => {
				console.log(err);
				alert('Internal Server Error Alert Occured');
			});
	}
}

async function loadVotePage(data) {
	let timeSpan;
	let durationLabel;
	let pollQuestion;
	let pollQuestionImage;
	let image;
	let pollAndPollOptionContainer;
	let createdBy;
	let i, cancelButton, homeButton, resultButton;
	let pollOption, pollOptionImage;
	let pollOptionInput;
	let pollOptionLabelDiv;
	let pollOptionLabel;
	let voteButton, footer, loaderComponent, endedContainer, endedContent;
	let temp = calculateDifferenceBetweenDates(data.duration);
	if (!temp.days && !temp.hours && !temp.minutes && !temp.seconds) {
		endedContainer = document.createElement('div');
		endedContainer.setAttribute('class', 'alignCenter ended-poll');

		endedContent = document.createElement('h3');
		endedContent.innerText = 'Poll has been ended';

		homeButton = document.createElement('a');
		homeButton.setAttribute('class', 'pollapp-button button-secondary mR30');
		homeButton.innerText = 'Home';
		homeButton.href = '/';

		resultButton = document.createElement('a');
		resultButton.setAttribute('class', 'pollapp-button button-primary');
		resultButton.innerText = 'View Result';
		resultButton.href = `#view/${data.id}`;

		footer = document.createElement('div');
		footer.setAttribute('class', 'mT40 d-flex');
		footer.appendChild(homeButton);
		footer.appendChild(resultButton);

		endedContainer.appendChild(endedContent);
		endedContainer.appendChild(footer);
		$('#displayContent').html(endedContainer);
	} else {
		timeSpan = document.createElement('span');
		timeSpan.setAttribute('name', 'time');
		timeSpan.setAttribute('index', data.id);
		timeSpan.setAttribute('duration', data.duration);
		timeSpan.setAttribute('id', `time_${data.id}`);
		timeSpan.innerText = temp.formattedDate;

		durationLabel = document.createElement('h6');
		durationLabel.setAttribute('class', 'poll-dash-timer poll-created-timer');
		durationLabel.innerText = 'ENDS IN: ';
		durationLabel.appendChild(timeSpan);

		pollQuestion = document.createElement('div');
		pollQuestion.setAttribute('class', 'poll-jumbotron-header');
		pollQuestion.innerText = data.content;

		if (data.file_id) {
			image = document.createElement('img');
			image.src = `https://${document.domain}/server/poll_service/imageLoader/${data.file_id}`;

			pollQuestionImage = document.createElement('div');
			pollQuestionImage.setAttribute('class', 'poll-question-image-holder');
			pollQuestionImage.appendChild(image);
			pollQuestionImage.style.marginTop = '10px';
		}

		createdBy = document.createElement('h6');
		createdBy.setAttribute('class', 'poll-meta-data');
		createdBy.innerText = `Created by : ${data.created_by}`;

		pollAndPollOptionContainer = document.createElement('div');
		pollAndPollOptionContainer.setAttribute('class', 'create-poll-wrap');
		pollAndPollOptionContainer.appendChild(durationLabel);
		pollAndPollOptionContainer.appendChild(pollQuestion);
		if (data.file_id) {
			pollAndPollOptionContainer.appendChild(pollQuestionImage);
		}
		pollAndPollOptionContainer.appendChild(createdBy);

		for (i = 0; i < data.options.length; i++) {
			pollOptionInput = document.createElement('input');
			pollOptionInput.type = 'radio';
			pollOptionInput.value = data.options[i].id;
			pollOptionInput.setAttribute('name', 'pollOption');

			pollOptionLabel = document.createElement('span');
			pollOptionLabel.setAttribute('class', 'poll-answer');
			pollOptionLabel.innerText = data.options[i].content;

			pollOptionLabelDiv = document.createElement('div');
			pollOptionLabelDiv.setAttribute('class', 'mL30');
			pollOptionLabelDiv.appendChild(pollOptionLabel);

			if (data.options[i].file_id) {
				image = document.createElement('img');
				image.src = `https://${document.domain}/server/poll_service/imageLoader/${data.options[i].file_id}`;
				pollOptionImage = document.createElement('div');
				pollOptionImage.setAttribute('class', 'poll-answer-image-holder');
				pollOptionImage.appendChild(image);
				pollOptionImage.style.marginTop = '10px';
			}

			pollOption = document.createElement('label');
			pollOption.setAttribute('class', 'poll-answer-wrap');
			pollOption.appendChild(pollOptionInput);
			pollOption.appendChild(document.createElement('span'));
			pollOption.appendChild(pollOptionLabelDiv);

			if (data.options[i].file_id) {
				pollOption.appendChild(pollOptionImage);
			}

			pollAndPollOptionContainer.appendChild(pollOption);
		}

		voteButton = document.createElement('button');
		voteButton.setAttribute('class', 'pollapp-button button-primary');
		voteButton.innerText = 'Vote';
		voteButton.setAttribute('index', data.id);
		voteButton.addEventListener('click', (event) => {
			saveVote(event.target);
		});

		cancelButton = document.createElement('a');
		cancelButton.setAttribute('class', 'pollapp-button button-secondary mR30');
		cancelButton.setAttribute('id', 'cancelPoll');
		cancelButton.innerText = 'Cancel';
		cancelButton.href = '/';
		loaderComponent = loader('18px', 'none', true, false, 'vote');

		footer = document.createElement('div');
		footer.setAttribute('class', 'mT40 d-flex');
		footer.appendChild(cancelButton);
		footer.appendChild(voteButton);
		footer.appendChild(loaderComponent);

		pollAndPollOptionContainer.appendChild(footer);

		let parentDiv = document.createElement('div');
		parentDiv.setAttribute('class', 'container maxW625 mT30');
		parentDiv.appendChild(pollAndPollOptionContainer);

		$('#displayContent').html(parentDiv);
	}
}

async function loadVotedPoll(data) {
	let parentDiv,
		pollAndPollOptionContainer,
		pollQuestion,
		pollQuestionDiv,
		image,
		percentage,
		pollShareDiv,
		pollShareTitle,
		twitterShareDiv,
		twitterShareIcon,
		twitterSharelink;
	let footerDiv, homeButton, i;
	let pollDiv,
		pollTitle,
		pollPercentageDiv,
		votesSpan,
		colorSpan,
		pollTitleSpan,
		pollImage,
		pollImageDiv;

	pollShareTitle = document.createElement('h6');
	pollShareTitle.innerText = 'Share this Poll';
	pollShareTitle.setAttribute('class', 'mB15');

	twitterShareDiv = document.createElement('div');
	twitterShareDiv.setAttribute('class', 'd-flex');

	twitterShareIcon = document.createElement('img');
	twitterShareIcon.src = 'images/twitter.png';
	twitterShareIcon.setAttribute('class', 'share-icon');

	twitterSharelink = document.createElement('a');
	twitterSharelink.setAttribute('class', 'share-link share-twitter');
	twitterSharelink.target = '_blank';
	twitterSharelink.href = `http://www.twitter.com/intent/tweet?text=${data.content}? Vote now at &url=https://${document.domain}/app/index.html%23vote/${data.poll_id}`;
	twitterSharelink.innerText = 'Share on Twitter';

	twitterShareDiv.appendChild(twitterShareIcon);
	twitterShareDiv.appendChild(twitterSharelink);

	pollShareDiv = document.createElement('div');
	pollShareDiv.setAttribute('class', 'create-poll-wrap share-poll-wrap mB10');
	pollShareDiv.appendChild(pollShareTitle);
	pollShareDiv.appendChild(twitterShareDiv);

	pollQuestion = document.createElement('h4');
	pollQuestion.setAttribute('class', 'poll-jumb0tron-header');
	pollQuestion.innerText = data.content;

	if (data.file_id) {
		image = document.createElement('img');
		image.src = `https://${document.domain}/server/poll_service/imageLoader/${data.file_id}`;
		pollQuestionDiv = document.createElement('div');
		pollQuestionDiv.setAttribute('class', 'poll-answer-image-holder');
		pollQuestionDiv.appendChild(image);
		pollQuestionDiv.style.marginBottom = '10px';
	}

	pollAndPollOptionContainer = document.createElement('div');
	pollAndPollOptionContainer.setAttribute('class', 'create-poll-wrap');
	pollAndPollOptionContainer.appendChild(pollQuestion);

	if (data.file_id) {
		pollAndPollOptionContainer.appendChild(pollQuestionDiv);
	}

	for (i = 0; i < data.options.length; i++) {
		pollDiv = document.createElement('div');
		if (parseInt(data.votes)) {
			percentage = parseInt(data.options[i].votes) / parseInt(data.votes);
			percentage *= 100;
			percentage = Math.round(percentage);
		} else {
			percentage = 0;
		}

		pollTitleSpan = document.createElement('span');
		pollTitleSpan.innerText = percentage + '%';

		pollTitle = document.createElement('h6');
		pollTitle.innerText = data.options[i].content;
		pollTitle.appendChild(pollTitleSpan);
		pollDiv.setAttribute('class', 'poll-answershown-wrap');

		pollDiv.appendChild(pollTitle);

		if (data.options[i].file_id) {
			pollImage = document.createElement('img');
			pollImage.src = `https://${document.domain}/server/poll_service/imageLoader/${data.options[i].file_id}`;

			pollImageDiv = document.createElement('div');
			pollImageDiv.setAttribute('class', 'poll-question-image-holder');
			pollImageDiv.appendChild(pollImage);
			pollImageDiv.style.marginBottom = '10px';

			pollDiv.appendChild(pollImageDiv);
		}

		colorSpan = document.createElement('span');
		colorSpan.style.width = `${percentage}%`;

		pollPercentageDiv = document.createElement('div');
		pollPercentageDiv.setAttribute(
			'class',
			`vote-percentage-wrap ${getClassNames(parseInt(percentage))}`
		);
		pollPercentageDiv.appendChild(colorSpan);

		votesSpan = document.createElement('span');
		votesSpan.innerText = `${data.options[i].votes} votes`;

		pollDiv.appendChild(pollPercentageDiv);
		pollDiv.appendChild(votesSpan);

		pollAndPollOptionContainer.appendChild(pollDiv);
	}

	homeButton = document.createElement('a');
	homeButton.setAttribute('class', 'pollapp-button button-primary-hollow mR30');
	homeButton.innerText = 'Home';
	homeButton.href = '/';

	footerDiv = document.createElement('div');
	footerDiv.setAttribute('class', 'mT30');
	footerDiv.appendChild(homeButton);

	parentDiv = document.createElement('div');
	parentDiv.setAttribute('class', 'container maxW625 mT30');
	parentDiv.appendChild(pollShareDiv);
	parentDiv.appendChild(pollAndPollOptionContainer);
	parentDiv.appendChild(footerDiv);

	$('#displayContent').html(parentDiv);
}

function getClassNames(percentage) {
	if (percentage >= 80) return 'perc-green';
	else if (percentage >= 60) {
		return 'perc-blue';
	} else if (percentage >= 25) {
		return 'perc-yellow';
	}
	return 'perc-red';
}
function loadEndedCard(data) {
	let categorySpan, votesSpan, headerDiv;
	let contentLabel, durationLabel, childDiv, parentDiv;
	let pollDiv,
		percentage = 0,
		pollTitle,
		pollTitleSpan,
		viewDetailedResults,
		buttonLoaderDiv,
		loaderComponent;

	categorySpan = document.createElement('span');
	categorySpan.setAttribute('class', 'poll-dash-tags poll-dash-tags-ctgry');
	categorySpan.innerText = data.category;

	votesSpan = document.createElement('span');
	votesSpan.setAttribute('class', 'poll-dash-tags poll-dash-tags-votes');
	votesSpan.innerText = data.votes + ' Votes';

	headerDiv = document.createElement('div');
	headerDiv.setAttribute('class', 'mB10');
	headerDiv.appendChild(categorySpan);
	headerDiv.appendChild(votesSpan);

	contentLabel = document.createElement('h4');
	contentLabel.setAttribute('class', 'poll-dash-header');
	contentLabel.innerText = data.content;

	durationLabel = document.createElement('h6');
	durationLabel.setAttribute('class', 'poll-dash-timer');
	durationLabel.innerText =
		'ENDED ON: ' + moment(data.duration).format('D MMM YYYY,HH:mm');

	pollDiv = document.createElement('div');

	if (parseInt(data.votes)) {
		percentage = parseInt(data.maxVotedPollVotes) / parseInt(data.votes);
		percentage *= 100;
		percentage = Math.round(percentage);
	}

	pollTitleSpan = document.createElement('span');
	pollTitleSpan.innerText = percentage + '%';

	pollTitle = document.createElement('h6');
	pollTitle.innerText = data.maxVotedPoll;
	pollTitle.appendChild(pollTitleSpan);

	pollDiv.setAttribute('class', 'poll-answershown-wrap user-selected-green');
	pollDiv.appendChild(pollTitle);

	colorSpan = document.createElement('span');
	colorSpan.style.width = `${percentage}%`;

	pollPercentageDiv = document.createElement('div');
	pollPercentageDiv.setAttribute('class', `vote-percentage-wrap perc-green`);
	pollPercentageDiv.appendChild(colorSpan);

	votesSpan = document.createElement('span');
	votesSpan.innerText = `${data.maxVotedPollVotes} votes`;

	pollDiv.appendChild(pollPercentageDiv);
	pollDiv.appendChild(votesSpan);

	loaderComponent = loader('22px', 'none', true, false, data.id);

	viewDetailedResults = document.createElement('a');
	viewDetailedResults.setAttribute(
		'class',
		'pollapp-button button-primary-hollow'
	);
	viewDetailedResults.innerText = 'View Results';
	viewDetailedResults.href = `#view/${data.id}`;

	buttonLoaderDiv = document.createElement('div');
	buttonLoaderDiv.style.display = 'flex';
	buttonLoaderDiv.appendChild(viewDetailedResults);
	buttonLoaderDiv.appendChild(loaderComponent);

	childDiv = document.createElement('div');
	childDiv.setAttribute('class', 'poll-dashboard my-votes-dashboard');
	childDiv.appendChild(headerDiv);
	childDiv.appendChild(contentLabel);
	childDiv.appendChild(durationLabel);
	// childDiv.appendChild(pollDiv);
	childDiv.appendChild(buttonLoaderDiv);

	parentDiv = document.createElement('div');
	parentDiv.setAttribute('class', 'col-lg-4 col-md-6 remove-padding');
	parentDiv.appendChild(childDiv);

	return parentDiv;
}

function getPollDetails(poll_id) {
	$(`#loader_${poll_id}`).css('display', 'block');
	let status, data;
	var settings = {
		url: '/server/poll_service/pollDetails',
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		data: JSON.stringify({
			id: poll_id
		})
	};

	$.ajax(settings)
		.then(function (response) {
			status = response.status;
			data = response.data;
			if (status) {
				loadVotedPoll({
					...data,
					poll_id
				});
			}
		})
		.catch((err) => {
			console.log(err);
			alert('Internal Server Error Alert Occured');
		});
}

function loadPagination(pages, currentPage) {
	if (pages > 1) {
		let navigation, unorderedList, icon, title, pageItems, buttonTag, i;
		navigation = document.createElement('nav');

		unorderedList = document.createElement('ul');
		unorderedList.setAttribute('class', 'pagination');

		buttonTag = document.createElement('button');
		buttonTag.setAttribute('class', 'page-link');
		buttonTag.setAttribute('pageNumber', currentPage - 1);
		buttonTag.setAttribute('currentPage', currentPage);
		buttonTag.setAttribute('totalPages', pages);
		buttonTag.addEventListener('click', (event) => {
			changePage(event.target);
		});
		buttonTag.innerText = '<';

		pageItems = document.createElement('li');
		if (currentPage !== 1) {
			pageItems.setAttribute('class', 'page-item page-num');
		} else {
			pageItems.setAttribute('class', 'page-item page-num disabled');
		}
		pageItems.appendChild(buttonTag);

		unorderedList.appendChild(pageItems);

		for (i = 1; i <= pages; i++) {
			buttonTag = document.createElement('button');
			buttonTag.setAttribute('pageNumber', i);
			buttonTag.setAttribute('currentPage', currentPage);
			buttonTag.setAttribute('totalPages', pages);
			buttonTag.addEventListener('click', (event) => {
				changePage(event.target);
			});

			if (i === currentPage) {
				buttonTag.setAttribute('class', 'page-link');
				buttonTag.style.color = 'blue';
			} else {
				buttonTag.setAttribute('class', 'page-link');
			}
			buttonTag.innerText = i;

			pageItems = document.createElement('li');
			pageItems.setAttribute('class', 'page-item ');
			pageItems.appendChild(buttonTag);
			unorderedList.appendChild(pageItems);
		}

		buttonTag = document.createElement('button');
		buttonTag.setAttribute('class', 'page-link');
		buttonTag.setAttribute('class', 'page-link');
		buttonTag.setAttribute('pageNumber', currentPage + 1);
		buttonTag.setAttribute('currentPage', currentPage);
		buttonTag.setAttribute('totalPages', pages);
		buttonTag.addEventListener('click', (event) => {
			changePage(event.target);
		});
		buttonTag.innerText = '>';

		pageItems = document.createElement('li');
		if (currentPage !== pages) {
			pageItems.setAttribute('class', 'page-item page-num');
		} else {
			pageItems.setAttribute('class', 'page-item page-num disabled');
		}
		pageItems.appendChild(buttonTag);

		unorderedList.appendChild(pageItems);

		navigation.appendChild(unorderedList);

		$('#pagination').html(navigation);
	} else {
		$('#pagination').html('<div></div>');
	}
}

function changePage(element) {
	let totalPage = parseInt(element.getAttribute('totalPages'));
	let pageNumber = parseInt(element.getAttribute('pageNumber'));

	if (currentPage !== pageNumber && pageNumber <= totalPage) {
		currentPage = pageNumber;
		generateCards(pageNumber);
	}
}

function loadLoginPage() {

	let parentDiv = document.createElement('div');
	let signUpDiv = document.createElement('div');
	signUpDiv.innerHTML =
		'New user ? <a class="purple-color" href="#signup">Sign up</a> now</p>';
	signUpDiv.style.marginTop = '10px';
	parentDiv.setAttribute('class', 'container maxW625 centerContainer');

	let bodyDiv = document.createElement('div');
	bodyDiv.setAttribute('class', 'mB30');

	let pollSpan = document.createElement('span');
	pollSpan.style.color = '#6267F5';
	pollSpan.innerText = 'Polls!';

	let loginTitleSpan = document.createElement('span');
	loginTitleSpan.innerText = 'Log in to ';

	let title = document.createElement('h4');
	title.setAttribute('class', 'poll-jumbotron-header');
	title.appendChild(loginTitleSpan);
	title.appendChild(pollSpan);

	let loginDiv = document.createElement('div');
	loginDiv.setAttribute('id', 'login');
	loginDiv.setAttribute('class', 'login');

	bodyDiv.appendChild(title);
	bodyDiv.appendChild(loginDiv);
	bodyDiv.appendChild(signUpDiv);

	parentDiv.appendChild(bodyDiv);

	$('#displayContent').html(parentDiv);
	catalyst.auth.signIn('login');
}

function loadSignUpPage() {
	let input, inputDiv, inputTitle;
	let parentDiv = document.createElement('div');
	parentDiv.setAttribute('class', 'container maxW625 centerContainerSignUp');

	let headerDiv = document.createElement('div');
	headerDiv.setAttribute('class', 'text-center mB30');

	let pollSpan = document.createElement('span');
	pollSpan.style.color = '#6267F5';
	pollSpan.innerText = 'Polls!';

	let loginTitleSpan = document.createElement('span');
	loginTitleSpan.innerText = 'Get started with ';

	let title = document.createElement('h4');
	title.setAttribute('class', 'poll-jumbotron-header');
	title.appendChild(loginTitleSpan);
	title.appendChild(pollSpan);
	headerDiv.appendChild(title);

	let bodyDiv = document.createElement('div');
	bodyDiv.setAttribute('class', 'start-form-wrap');

	let form = document.createElement('form');
	form.autocomplete = 'off';
	form.addEventListener('submit', (event) => {
		registerUser(event);
	});

	inputTitle = document.createElement('h6');
	inputTitle.innerText = 'First Name';

	input = document.createElement('input');
	input.setAttribute('id', 'first_name');
	input.type = 'text';
	input.placeholder = 'Your First Name';
	input.required = true;

	inputDiv = document.createElement('div');
	inputDiv.setAttribute('class', 'input-group mB20');
	inputDiv.appendChild(inputTitle);
	inputDiv.appendChild(input);
	form.appendChild(inputDiv);

	inputTitle = document.createElement('h6');
	inputTitle.innerText = 'Last Name';

	input = document.createElement('input');
	input.setAttribute('id', 'last_name');
	input.type = 'text';
	input.placeholder = 'Your Last Name';
	input.required = true;

	inputDiv = document.createElement('div');
	inputDiv.setAttribute('class', 'input-group mB20');
	inputDiv.appendChild(inputTitle);
	inputDiv.appendChild(input);
	form.appendChild(inputDiv);

	inputTitle = document.createElement('h6');
	inputTitle.innerText = 'Email ID';

	input = document.createElement('input');
	input.setAttribute('id', 'email');
	input.type = 'email';
	input.placeholder = 'Your Email';
	input.required = true;

	inputDiv = document.createElement('div');
	inputDiv.setAttribute('class', 'input-group mB20');
	inputDiv.appendChild(inputTitle);
	inputDiv.appendChild(input);
	form.appendChild(inputDiv);

	let signUpButton = document.createElement('button');
	signUpButton.setAttribute('class', 'pollapp-button button-primary w-100');
	signUpButton.setAttribute('id', 'signUp');
	signUpButton.type = 'submit';

	signUpButton.innerText = 'Sign Up';
	form.appendChild(signUpButton);
	bodyDiv.appendChild(form);

	let loginButton = document.createElement('p');
	loginButton.setAttribute('class', 'mT40 text-center');
	loginButton.innerHTML = `Already have an account? <a class="purple-color" href="#login">Login</a></p>`;
	bodyDiv.appendChild(loginButton);

	let response = document.createElement('p');
	loginButton.setAttribute('class', 'mT40 text-center');
	response.setAttribute('id', 'response');
	bodyDiv.appendChild(response);

	parentDiv.appendChild(headerDiv);
	parentDiv.appendChild(bodyDiv);

	$('#displayContent').html(parentDiv);
}

function registerUser(event) {
	event.preventDefault();
	$('#signUp').attr('disabled', true);
	let first_name = $('#first_name').val();
	let last_name = $('#last_name').val();
	let email_id = $('#email').val();
	let status = false;

	var settings = {
		url: `/server/poll_service/register`,
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		data: JSON.stringify({
			first_name,
			last_name,
			email_id
		})
	};

	$.ajax(settings)
		.then((response) => {
			status = response.status;
			if (status) {
				$('#response').text(
					'The above email has been registered successfully, check your mail for further information'
				);
			}
			setTimeout(() => {
				window.location.hash = '/';
			}, 5000);
		})
		.catch((err) => {
			console.log(err);
			if (err.status === 400) {
				alert('Email ID already exists');
			} else {
				alert('Internal Server Error Alert Occured');
			}
		});
}

function loader(dimension, display, float, center, id, color, home) {
	let spinnerParentDiv = document.createElement('span');
	if (center) {
		spinnerParentDiv.setAttribute('class', 'd-flex justify-content-center');
		spinnerParentDiv.style.width = '100%';
		spinnerParentDiv.style.height = '100%';
	}

	var spinnerDiv = document.createElement('span');

	spinnerDiv.style.height = dimension;
	spinnerDiv.style.width = dimension;

	if (color) {
		spinnerDiv.style.color = color;
	} else {
		spinnerDiv.style.color = '#6267F5';
	}
	spinnerDiv.style.display = display;

	if (float) {
		spinnerDiv.setAttribute('class', 'spinner-border float-right');
		spinnerDiv.style.margin = '1px 15px';
	} else if (home) {
		spinnerDiv.setAttribute('class', 'spinner-border home');
	} else {
		spinnerDiv.setAttribute('class', 'spinner-border');
	}
	if (id) {
		spinnerDiv.setAttribute('id', 'loader_' + id);
	}
	spinnerParentDiv.appendChild(spinnerDiv);

	return spinnerParentDiv;
}

//No Polls

function showNoPolls(message) {
	let parentDiv = document.createElement('div');
	parentDiv.setAttribute('class', 'noPollsContainer');

	let messageDiv = document.createElement('div');
	messageDiv.innerHTML = message;
	parentDiv.appendChild(messageDiv);

	return parentDiv;
}
