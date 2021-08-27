var previousTab = "AllPolls";
var currentPage = 1;
var intervalID = "";
var userData = {};
var inHomePage = true;

window.onload = async () => {
  document.querySelector('meta[property="twitter:image"]').setAttribute("content", `https://${document.domain}/app/images/Polls.png`);
  await getCurrentUserData()
    .then((response) => {
      userData = response;
      $("#topCornerName").text(`${userData.first_name}  ${userData.last_name}`);
      showContent("home");
    })
    .catch((err) => {
      console.log(err);
      window.location.href = "index.html";
    });
};

function reload() {
  window.location.reload();
}

// logout
function logout() {
  var redirectURL = "https://" + document.domain + "/app/";
  // var localHosturl = "http://localhost:3000/app/";
  var auth = catalyst.auth;
  auth.signOut(redirectURL);
  // auth.signOut(localHosturl);
}

// Update Poll
function updateEndTime(element) {
  let index = $(element).attr("index");
  $("#updateCancel").attr("disabled", true);
  $("#updateClose").attr("disabled", true);
  $("#updateButton").attr("disabled", true);
  $("#updateLoader").css("display", "block");
  let newDuration = moment($("#updatePollValue").val()).format(
    "YYYY-MM-DD HH:mm:ss"
  );
  let status = false;
  var settings = {
    url: "/server/poll_service/updatePoll",
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    data: JSON.stringify({
      id: index,
      duration: newDuration,
    }),
  };
  // var settings = {
  //     "url": "/server/poll_service_java/updatePoll",
  //     "method": "POST",
  //     "headers": {
  //         "content-type": "application/json",
  //     },
  //     "processData": false,
  //     "data": JSON.stringify({
  //         id: index,
  //         duration: newDuration
  //     })
  // }

  $.ajax(settings)
    .then((response) => {
      // response = JSON.parse(response);
      status = response.status;
      if (status) {
        $(`#time_${index}`).attr("duration", newDuration);
        $("#updatePollButton").removeAttr("index");
        $("#changeDateTime").modal("hide");
      }
    })
    .catch((err) => {
      $("#updateCancel").removeAttr("disabled");
      $("#updateClose").removeAttr("disabled");
      $("#updateButton").removeAttr("disabled");
      $("#updateLoader").css("display", "none");
      console.log(err);
      alert("Internal Server Error Alert Occured");
    });
}

// Delete Poll
function deletePoll(element) {
  let index = parseInt($(element).attr("index"));
  $("#deleteCancel").attr("disabled", true);
  $("#deleteButton").attr("disabled", true);
  $("#deleteLoader").css("display", "block");
  let status = false;
  var settings = {
    url: "/server/poll_service/deletePoll",
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    data: JSON.stringify({
      id: index,
    }),
  };
  // var settings = {
  //     "url": "/server/poll_service_java/deletePoll",
  //     "method": "POST",
  //     "headers": {
  //         "content-type": "application/json",
  //     },
  //     "processData": false,
  //     "data": JSON.stringify({
  //         id: index,
  //     })
  // }
  console.log(settings)
  $.ajax(settings)
    .then((response) => {
      // response = JSON.parse(response);
      status = response.status;
      if (status) {
        generateCards("MyPolls");
        $("#pollQuestionTitle").text("");
        $("#deletePollButton").removeAttr("index");
        $("#deletePoll").modal("hide");
      }
    })
    .catch((err) => {
      console.log(err);
      alert("Internal Server Error Alert Occured");
      $("#deleteCancel").removeAttr("disabled");
      $("#deleteClose").removeAttr("disabled");
      $("#deleteButton").removeAttr("disabled");
      $("#deleteLoader").css("display", "none");
    });
}

// Open Edit Dialog
function openEditDialog(element) {
  let index = parseInt(element.getAttribute("index"));
  let duration = $(`#time_${index}`).attr("duration");
  $("#updatePollTitle").text($(`#header${index}`).text());
  $("#updateButton").attr("index", index);
  $("#updatePollValue").val(moment(duration).format("YYYY-MM-DDTHH:mm"));
  $("#changeDateTime").modal("show");
  $("#updateCancel").removeAttr("disabled");
  $("#updateClose").removeAttr("disabled");
  $("#updateButton").removeAttr("disabled");
  $("#updateLoader").css("display", "none");
}

// Open delete Dialog
function openDeleteDialog(element) {
  let index = element.getAttribute("index");
  $("#pollQuestionTitle").text($(`#header${index}`).text());
  $("#deleteButton").attr("index", index);
  $("#deletePoll").modal("show");
  $("#deleteCancel").removeAttr("disabled");
  $("#deleteClose").removeAttr("disabled");
  $("#deleteButton").removeAttr("disabled");
  $("#deleteLoader").css("display", "none");
}

//Create poll Page
function loadCreatePollPage() {
  let options = ["Animals","Art","Books","Colour","Crypto","Days","Drink","Food","Gaming","Healthcare","History","Investment","Mobile Development","Movies","Music","News","Politics","Random","Science","Social","Sports","Startup","Tv","Web Design","Web Development","Others"];

  let heading = document.createElement("h4");
  heading.setAttribute("class", "poll-jumbotron-header");
  heading.innerText = "Create a Poll";

  let headerDiv = document.createElement("div");
  headerDiv.setAttribute("class", "mB30");
  headerDiv.appendChild(heading);

  let pollOptions = loadDefaultPollOptions();

  let optionsDiv = document.createElement("div");
  optionsDiv.setAttribute("id", "Options");

  pollOptions.forEach((element) => {
    optionsDiv.appendChild(element);
  });

  let categoryLabel = document.createElement("h6");
  categoryLabel.innerText = "Select a category";

  let catergorySelect = document.createElement("select");
  catergorySelect.required = true;
  // catergorySelect.setAttribute("class","form-select custom-select");
  catergorySelect.id = "Category";

  options.forEach((option) => {
    let optionElement = document.createElement("option");
    optionElement.innerText = option;
    catergorySelect.appendChild(optionElement);
  });

  let categoryDiv = document.createElement("div");
  categoryDiv.setAttribute("class", "input-group mB20");
  categoryDiv.appendChild(categoryLabel);
  categoryDiv.appendChild(catergorySelect);

  let dateTimeLabel = document.createElement("h6");
  dateTimeLabel.innerText = "Select poll end date & time";

  let dateTimeInput = document.createElement("input");
  dateTimeInput.type = "datetime-local";
  dateTimeInput.id = "Duration";
  dateTimeInput.required = true;

  let dateTimeDiv = document.createElement("div");
  dateTimeDiv.setAttribute("class", "input-group");
  dateTimeDiv.appendChild(dateTimeLabel);
  dateTimeDiv.appendChild(dateTimeInput);

  let cancelButton = document.createElement("button");
  cancelButton.setAttribute("class", "pollapp-button button-secondary mR30");
  cancelButton.setAttribute("id", "cancelPoll");
  cancelButton.innerText = "Cancel";
  cancelButton.addEventListener("click", () => {
    showContent("home");
  });

  let loaderSpan = loader("22px", "none", false, false, "save", "white");
  loaderSpan.style.marginLeft = "10px";

  let titleSpan = document.createElement("span");
  titleSpan.innerText = "Create Poll";

  let buttonSpan = document.createElement("span");
  buttonSpan.setAttribute("class", "d-flex");
  buttonSpan.appendChild(titleSpan);
  buttonSpan.appendChild(loaderSpan);

  let saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.setAttribute("class", "pollapp-button button-primary");
  saveButton.setAttribute("id", "savePoll");
  saveButton.appendChild(buttonSpan);

  let footerDiv = document.createElement("footer");
  footerDiv.setAttribute("class", "mT40");
  footerDiv.appendChild(cancelButton);
  footerDiv.appendChild(saveButton);

  let pollAndPollOptionDiv = document.createElement("div");
  pollAndPollOptionDiv.setAttribute("class", "create-poll-wrap");
  pollAndPollOptionDiv.appendChild(loadDefaultQuestion());
  pollAndPollOptionDiv.appendChild(optionsDiv);
  pollAndPollOptionDiv.appendChild(categoryDiv);
  pollAndPollOptionDiv.appendChild(dateTimeDiv);
  pollAndPollOptionDiv.appendChild(footerDiv);

  let form = document.createElement("form");
  form.autocomplete = "off";
  form.appendChild(pollAndPollOptionDiv);
  form.addEventListener("submit", (event) => {
    savePoll(event);
  });

  let parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "container maxW625 mT50");
  parentDiv.appendChild(headerDiv);
  parentDiv.appendChild(form);
  $("#displayContent").html(parentDiv);
}

//Save Poll
async function savePoll(event) {
  event.preventDefault();
  $("#savePoll").attr("disabled", true);
  $("#savePoll").css("opacity", '0.7');
  $("#cancelPoll").attr("disabled", true);
  $("#loader_save").css("display", "block");
  let i;
  let status = false;
  let data = {};
  let pollQuestionImage = $("#QuestionImage")[0].files[0];
  let temp, pollOptionImage;
  let insertPollData = {
    file_id: "",
    content: $("#QuestionContent").val(),
    duration: moment($("#Duration").val()).format("YYYY-MM-DD HH:mm:ss"),
    category: $("#Category").val(),
    created_by: userData.first_name + " " + userData.last_name,
  };
  let insertPollOptionsData = [];
  let FOLDER_ID;
  var settings = {
    "url": "/server/poll_service/FOLDER_ID",
    "method": "GET",
  }
  await $.ajax(settings).then((response => {
    FOLDER_ID = response.FOLDER_ID
  })).catch(err => {
    console.log(err)
  })
  if (pollQuestionImage) {
    await uploadImage(FOLDER_ID, pollQuestionImage)
      .then((response) => {
        insertPollData.file_id = response.id;
      })
      .catch((err) => {
        console.log(err);
        alert("Internal Server Error Alert Occured");
      });
  }

  let noOFOptions = parseInt(document.getElementsByName("Options").length) + 1;
  for (i = 1; i < noOFOptions; i++) {
    temp = {};
    temp = {
      file_id: "",
      content: $(`#Option${i}Content`).val(),
      poll_id: "",
    };
    pollOptionImage = $(`#Option${i}Image`)[0].files[0];
    if (pollOptionImage) {
      await uploadImage(FOLDER_ID, pollOptionImage)
        .then((response) => {
          temp.file_id = response.id;
        })
        .catch((err) => {
          console.log(err);
          alert("Internal Server Error Alert Occured");
        });
    }
    insertPollOptionsData.push(temp);
  }

  // var settings = {
  //     "url": "/server/poll_service_java/savePoll",
  //     "method": "POST",
  //     "headers": {
  //         "content-type": "application/json",
  //     },
  //     "data": JSON.stringify({
  //         insertPollData,
  //         insertPollOptionsData
  //     })
  // }
  var settings = {
    url: "/server/poll_service/savePoll",
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    data: JSON.stringify({
      insertPollData,
      insertPollOptionsData,
    }),
  };

  $.ajax(settings)
    .then(function (response) {
      // response = JSON.parse(response);
      status = response.status;
      data = response.data;

      if (status) {
        loadCreatedPoll(data);
      }
    })
    .catch((err) => {
      console.log(err);
      alert("Internal Server Error Alert Occured");
    });
}
//Change Tab
function changeTabClass(currentTab) {
  if (previousTab !== currentTab) {
    $(`#${previousTab}`).removeClass("active");
    $(`#${currentTab}`).addClass("active");
    currentPage = 1;
    changeTabContent(currentTab);
    previousTab = currentTab;
  }
}

//Change the content
function showContent(choice) {
  switch (choice) {
    case "home":
      inHomePage = true;
      loadHomePage();
      break;
    case "create_poll":
      inHomePage = false;
      loadCreatePollPage();
      break;
    default:
    // do nothing
  }
}

//get the details of poll
function getPollDetails(element) {
  element.disabled = true;
  let poll_id = element.getAttribute("index");
  $(`#loader_${poll_id}`).css("display", "block");
  let status, data;

  var settings = {
    url: "/server/poll_service/pollDetails",
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    data: JSON.stringify({
      id: poll_id,
      user_id: userData.user_id,
    }),
  };

  // var settings = {
  //     "url": "/server/poll_service_java/pollDetails",
  //     "method": "POST",
  //     "headers": {
  //         "content-type": "application/json",
  //     },
  //     "data": JSON.stringify({
  //         id: index,
  //         user_id: userData.user_id
  //     })
  // }

  $.ajax(settings)
    .then(function (response) {
      // response = JSON.parse(response);
      status = response.status;
      data = response.data;
      if (status) {
        loadVotedPoll({
          ...data,
          poll_id,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      alert("Internal Server Error Alert Occured");
    });
}

// Home page
function loadHomePage() {
  let parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "container mT50");

  let headerParentDiv = document.createElement("div");
  headerParentDiv.setAttribute("class", "row mB20");

  let headerChildDivOne = document.createElement("div");
  headerChildDivOne.setAttribute("class", "col-lg-7");

  let userName = document.createElement("h1");
  userName.setAttribute("class", "poll-jumbotron-header");
  userName.innerText = `Welcome, ${userData.first_name}  ${userData.last_name}`;
  headerChildDivOne.appendChild(userName);

  let headerChildDivTwo = document.createElement("div");
  headerChildDivTwo.setAttribute(
    "class",
    "col-lg-5 text-right d-flex align-items-center justify-content-end"
  );

  let createButton = document.createElement("button");
  createButton.setAttribute("class", "pollapp-button button-primary");
  createButton.innerText = "Create Poll";
  createButton.addEventListener("click", () => {
    showContent("create_poll");
  });
  headerChildDivTwo.appendChild(createButton);

  headerParentDiv.appendChild(headerChildDivOne);
  headerParentDiv.appendChild(headerChildDivTwo);

  let allPollButton = document.createElement("button");
  allPollButton.setAttribute("class", "nav-link");
  allPollButton.setAttribute("id", "AllPolls");
  allPollButton.addEventListener("click", () => {
    changeTabClass("AllPolls");
  });
  allPollButton.style.background = "none";
  allPollButton.innerText = "All Polls";

  let myVotesButton = document.createElement("button");
  myVotesButton.setAttribute("class", "nav-link");
  myVotesButton.setAttribute("id", "MyVotes");
  myVotesButton.addEventListener("click", () => {
    changeTabClass("MyVotes");
  });
  myVotesButton.style.background = "none";
  myVotesButton.innerText = "My Votes";

  let myPollsButton = document.createElement("button");
  myPollsButton.setAttribute("class", "nav-link");
  myPollsButton.setAttribute("id", "MyPolls");
  myPollsButton.addEventListener("click", () => {
    changeTabClass("MyPolls");
  });
  myPollsButton.style.background = "none";
  myPollsButton.innerText = "My Polls";

  if (previousTab === "AllPolls") {
    allPollButton.setAttribute("class", "nav-link active");
  } else if (previousTab === "MyVotes") {
    myVotesButton.setAttribute("class", "nav-link active");
  } else if (previousTab === "MyPolls") {
    myPollsButton.setAttribute("class", "nav-link active");
  }

  let allPollsNavItem = document.createElement("li");
  allPollsNavItem.setAttribute("class", "nav-item");
  allPollsNavItem.appendChild(allPollButton);

  let myVotesNavItem = document.createElement("li");
  myVotesNavItem.setAttribute("class", "nav-item");
  myVotesNavItem.appendChild(myVotesButton);

  let myPollsNavItem = document.createElement("li");
  myPollsNavItem.setAttribute("class", "nav-item");
  myPollsNavItem.appendChild(myPollsButton);

  let navigationList = document.createElement("ul");
  navigationList.setAttribute("class", "nav nav-tabs");
  navigationList.appendChild(allPollsNavItem);
  navigationList.appendChild(myVotesNavItem);
  navigationList.appendChild(myPollsNavItem);

  let tabContentDiv = document.createElement("div");
  tabContentDiv.setAttribute("class", "tab-content");
  tabContentDiv.setAttribute("id", "tabContent");

  let navigationDiv = document.createElement("div");
  navigationDiv.setAttribute("class", "col-12");
  navigationDiv.appendChild(navigationList);
  navigationDiv.appendChild(tabContentDiv);

  let bodyParentDiv = document.createElement("div");
  bodyParentDiv.setAttribute("class", "row");
  bodyParentDiv.appendChild(navigationDiv);

  parentDiv.appendChild(headerParentDiv);
  parentDiv.appendChild(bodyParentDiv);

  $("#displayContent").html(parentDiv);
  changeTabContent(previousTab);
}

// Difference calculator
function calculateDifferenceBetweenDates(date) {
  let endDate = moment(date);
  let temp = endDate.diff(moment(), "days");
  let days = temp > 0 ? temp : 0;
  endDate = endDate.subtract(days, "days");
  temp = endDate.diff(moment(), "hours");
  let hours = temp > 0 ? temp : 0;
  endDate = endDate.subtract(hours, "hours");
  temp = endDate.diff(moment(), "minutes");
  let minutes = temp > 0 ? temp : 0;
  endDate = endDate.subtract(minutes, "minutes");
  temp = endDate.diff(moment(), "seconds");
  let seconds = temp > 0 ? temp : 0;

  return {
    formattedDate: `${days.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}D : ${hours.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}H: ${minutes.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}M: ${seconds.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}`,
    seconds,
    hours,
    days,
    minutes,
  };
}

//Helper function to run timer
function realTimeTimer() {
  let timeDivs = document.getElementsByName("time");
  let i, poll_id, date, temp, endedContainer, endedContent, homeButton, resultButton, footer;
  for (i = 0; i < timeDivs.length; i++) {
    poll_id = parseInt(timeDivs[i].getAttribute("index"));
    date = timeDivs[i].getAttribute("duration");
    temp = calculateDifferenceBetweenDates(date);
    if (!temp.days && !temp.hours && !temp.minutes && !temp.seconds) {
      if (inHomePage) {
        changeTabContent(previousTab);
        break;
      } else {
        endedContainer = document.createElement("div");
        endedContainer.setAttribute("class", "alignCenter ended-poll")

        endedContent = document.createElement("h3");
        endedContent.innerText = "Poll has been ended";

        homeButton = document.createElement("button");
        homeButton.setAttribute("class", "pollapp-button button-secondary mR30");
        homeButton.innerText = "Home";
        homeButton.addEventListener("click", () => {
          showContent("home");
        });
        resultButton = document.createElement("button");
        resultButton.setAttribute("class", "pollapp-button button-primary");
        resultButton.setAttribute("index", poll_id)
        resultButton.innerText = "View Result";
        resultButton.addEventListener("click", (event) => {
          getPollDetails(event.currentTarget);
        });

        footer = document.createElement("div");
        footer.setAttribute("class", "mT40 d-flex");
        footer.appendChild(homeButton);
        footer.appendChild(resultButton);

        endedContainer.appendChild(endedContent);
        endedContainer.appendChild(footer);
        $("#displayContent").html(endedContainer);
      }
    }
    document.getElementById(`time_${poll_id}`).innerText = temp.formattedDate;
  }
}

//change tab content
function changeTabContent(choice) {
  let parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "tab-pane fade show active");

  let pollsDiv = document.createElement("div");
  pollsDiv.setAttribute("class", "row");
  pollsDiv.setAttribute("id", "polls");

  let paginationDiv = document.createElement("div");
  paginationDiv.setAttribute("id", "pagination");

  let completeCheckboxDiv = null;
  let completedLabel = null;
  let checkboxInput = null;

  if (choice === "MyVotes") {
    completedLabel = document.createElement("label");
    completedLabel.setAttribute("class", "m0 cp");

    completeCheckboxDiv = document.createElement("div");
    completeCheckboxDiv.setAttribute("class", "mT25 mB25");
    completeCheckboxDiv.appendChild(completedLabel);

    parentDiv.appendChild(completeCheckboxDiv);
  } else if (choice === "AllPolls") {
    checkboxInput = document.createElement("input");
    checkboxInput.setAttribute("class", "toggle-checkbox");
    checkboxInput.setAttribute("id", "checkBoxInput");
    checkboxInput.type = "checkbox";
    checkboxInput.addEventListener("change", () => {
      currentPage = 1;
      generateCards(previousTab);
    });

    let displaySpan = document.createElement("span");
    displaySpan.setAttribute("class", "toggle-checkbox-text");
    displaySpan.innerText = "View Completed";

    completedLabel = document.createElement("label");
    completedLabel.setAttribute("class", "m0 cp");
    completedLabel.appendChild(checkboxInput);
    completedLabel.appendChild(document.createElement("span"));
    completedLabel.appendChild(displaySpan);

    completeCheckboxDiv = document.createElement("div");
    completeCheckboxDiv.setAttribute("class", "mT25 mB25");
    completeCheckboxDiv.appendChild(completedLabel);

    parentDiv.appendChild(completeCheckboxDiv);
  } else {
    checkboxInput = document.createElement("input");
    checkboxInput.setAttribute("class", "toggle-checkbox");
    checkboxInput.setAttribute("id", "checkBoxInput");
    checkboxInput.type = "checkbox";
    checkboxInput.addEventListener("change", () => {
      currentPage = 1;
      generateCards(previousTab);
    });

    let displaySpan = document.createElement("span");
    displaySpan.setAttribute("class", "toggle-checkbox-text");
    displaySpan.innerText = "View Ended";

    completedLabel = document.createElement("label");
    completedLabel.setAttribute("class", "m0 cp");
    completedLabel.appendChild(checkboxInput);
    completedLabel.appendChild(document.createElement("span"));
    completedLabel.appendChild(displaySpan);

    completeCheckboxDiv = document.createElement("div");
    completeCheckboxDiv.setAttribute("class", "mT25 mB25");
    completeCheckboxDiv.appendChild(completedLabel);

    parentDiv.appendChild(completeCheckboxDiv);
  }
  parentDiv.appendChild(pollsDiv);
  parentDiv.appendChild(paginationDiv);

  $("#tabContent").html(parentDiv);
  generateCards(choice);
}

// Display voted poll
async function loadVotedPoll(data) {
  let parentDiv,
    pollAndPollOptionContainer,
    pollQuestion,
    pollQuestionDiv,
    image,
    userAnswer;
  let footerDiv, homeButton, createPollButton, i;
  let pollDiv,
    pollTitle,
    pollPercentageDiv,
    votesSpan,
    colorSpan,
    pollTitleSpan,
    pollImage,
    pollImageDiv,
    pollShareDiv,
    pollShareTitle,
    twitterShareDiv,
    twitterShareIcon,
    twitterSharelink;
  let percentage = 0;

  pollShareTitle = document.createElement("h6");
  pollShareTitle.innerText = "Share this Poll";
  pollShareTitle.setAttribute("class", "mB15");

  twitterShareDiv = document.createElement("div");
  twitterShareDiv.setAttribute("class", "d-flex");

  twitterShareIcon = document.createElement("img");
  twitterShareIcon.src = "images/twitter.png";
  twitterShareIcon.setAttribute("class", "share-icon");

  twitterSharelink = document.createElement("a");
  twitterSharelink.setAttribute("class", "share-link share-twitter");
  twitterSharelink.target = "_blank"
  twitterSharelink.href = `http://www.twitter.com/intent/tweet?text=${data.content}? Vote now at &url=https://${document.domain}/app/index.html%23vote/${data.poll_id}`;
  twitterSharelink.innerText = "Share on Twitter";


  twitterShareDiv.appendChild(twitterShareIcon);
  twitterShareDiv.appendChild(twitterSharelink);

  pollShareDiv = document.createElement("div");
  pollShareDiv.setAttribute("class", "create-poll-wrap share-poll-wrap mB10");
  pollShareDiv.appendChild(pollShareTitle);
  pollShareDiv.appendChild(twitterShareDiv);

  pollQuestion = document.createElement("h4");
  pollQuestion.setAttribute("class", "poll-jumb0tron-header");
  pollQuestion.innerText = data.content;

  if (data.file_id) {
    image = document.createElement("img");
    image.src = `https://${document.domain}/server/poll_service/imageLoader/${data.file_id}`;

    pollQuestionDiv = document.createElement("div");
    pollQuestionDiv.setAttribute("class", "poll-answer-image-holder");
    pollQuestionDiv.appendChild(image);
  }

  userAnswer = document.createElement("h6");
  userAnswer.setAttribute("class", "poll-meta-data");
  userAnswer.innerHTML = `You voted for : <b>${data.userVotedPoll}</b>`;

  pollAndPollOptionContainer = document.createElement("div");
  pollAndPollOptionContainer.setAttribute("class", "create-poll-wrap");
  pollAndPollOptionContainer.appendChild(pollQuestion);

  if (data.file_id) {
    pollAndPollOptionContainer.appendChild(pollQuestionDiv);
  }

  pollAndPollOptionContainer.appendChild(userAnswer);

  for (i = 0; i < data.options.length; i++) {
    pollDiv = document.createElement("div");
    percentage = 0;

    if (parseInt(data.votes)) {
      percentage =
        (parseInt(data.options[i].votes) / parseInt(data.votes)) * 100;
      percentage = Math.round(percentage);
    }

    pollTitleSpan = document.createElement("span");
    pollTitleSpan.innerText = percentage + "%";

    pollTitle = document.createElement("h6");
    pollTitle.innerText = data.options[i].content;
    pollTitle.appendChild(pollTitleSpan);

    if (data.options[i].content === data.userVotedPoll) {
      pollDiv.setAttribute(
        "class",
        "poll-answershown-wrap user-selected-green"
      );
    } else {
      pollDiv.setAttribute("class", "poll-answershown-wrap");
    }
    pollDiv.appendChild(pollTitle);

    if (data.options[i].file_id) {
      pollImage = document.createElement("img");
      pollImage.src = `https://${document.domain}/server/poll_service/imageLoader/${data.options[i].file_id}`;

      pollImageDiv = document.createElement("div");
      pollImageDiv.setAttribute("class", "poll-question-image-holder");
      pollImageDiv.appendChild(pollImage);

      pollDiv.appendChild(pollImageDiv);
    }

    colorSpan = document.createElement("span");
    colorSpan.style.width = `${percentage}%`;

    pollPercentageDiv = document.createElement("div");
    pollPercentageDiv.setAttribute(
      "class",
      `vote-percentage-wrap ${getClassNames(percentage)}`
    );
    pollPercentageDiv.appendChild(colorSpan);

    votesSpan = document.createElement("span");
    votesSpan.innerText = `${data.options[i].votes} votes`;

    pollDiv.appendChild(pollPercentageDiv);
    pollDiv.appendChild(votesSpan);

    pollAndPollOptionContainer.appendChild(pollDiv);
  }

  homeButton = document.createElement("button");
  homeButton.setAttribute("class", "pollapp-button button-primary-hollow mR30");
  homeButton.innerText = "Home";
  homeButton.addEventListener("click", () => {
    showContent("home");
  });

  createPollButton = document.createElement("button");
  createPollButton.setAttribute(
    "class",
    "pollapp-button button-primary-hollow"
  );
  createPollButton.innerText = "Create poll";
  createPollButton.addEventListener("click", () => {
    showContent("create_poll");
  });

  footerDiv = document.createElement("div");
  footerDiv.setAttribute("class", "mT30");
  footerDiv.appendChild(homeButton);
  footerDiv.appendChild(createPollButton);

  parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "container maxW625 mT50");
  parentDiv.appendChild(pollShareDiv);
  parentDiv.appendChild(pollAndPollOptionContainer);
  parentDiv.appendChild(footerDiv);

  $("#displayContent").html(parentDiv);
}

//Vote Card
function generateVoteCard(data) {
  let categorySpan, votesSpan, headerDiv;
  let contentLabel,
    durationLabel,
    voteButton,
    childDiv,
    parentDiv,
    timeSpan,
    buttonLoaderDiv,
    loaderComponent;

  categorySpan = document.createElement("span");
  categorySpan.setAttribute("class", "poll-dash-tags poll-dash-tags-ctgry");
  categorySpan.innerText = data.category;

  votesSpan = document.createElement("span");
  votesSpan.setAttribute("class", "poll-dash-tags poll-dash-tags-votes");
  votesSpan.innerText = data.votes + " Votes";

  headerDiv = document.createElement("div");
  headerDiv.setAttribute("class", "mB10");
  headerDiv.appendChild(categorySpan);
  headerDiv.appendChild(votesSpan);

  contentLabel = document.createElement("h4");
  contentLabel.setAttribute("class", "poll-dash-header");
  contentLabel.innerText = data.content;

  timeSpan = document.createElement("span");
  timeSpan.setAttribute("name", "time");
  timeSpan.setAttribute("index", data.id);
  timeSpan.setAttribute("duration", data.duration);
  timeSpan.setAttribute("id", `time_${data.id}`);
  timeSpan.innerText = calculateDifferenceBetweenDates(
    data.duration
  ).formattedDate;

  durationLabel = document.createElement("h6");
  durationLabel.setAttribute("class", "poll-dash-timer");
  durationLabel.innerText = "ENDS IN: ";
  durationLabel.appendChild(timeSpan);

  voteButton = document.createElement("button");
  voteButton.setAttribute("class", "pollapp-button button-primary-hollow");
  voteButton.setAttribute("index", data.id);
  voteButton.innerText = "Vote Now";
  voteButton.addEventListener("click", (event) => {
    getPollVoteData(event.currentTarget);
  });

  loaderComponent = loader("22px", "none", true, false, data.id);

  buttonLoaderDiv = document.createElement("div");
  buttonLoaderDiv.style.display = "flex";
  buttonLoaderDiv.appendChild(voteButton);
  buttonLoaderDiv.appendChild(loaderComponent);

  childDiv = document.createElement("div");
  childDiv.appendChild(headerDiv);
  childDiv.setAttribute("class", "poll-dashboard");
  childDiv.appendChild(contentLabel);
  childDiv.appendChild(durationLabel);
  childDiv.appendChild(buttonLoaderDiv);

  parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "col-lg-4 col-md-6 remove-padding");
  parentDiv.appendChild(childDiv);

  return parentDiv;
}

//Voted Card
function generateVotedCard(data) {
  let categorySpan, votesSpan, headerDiv;
  let contentLabel, durationLabel, childDiv, parentDiv, timeSpan;
  let pollResultDiv,
    userVoteHeader,
    userVote,
    otherUsersVotes,
    viewDetailedResults,
    buttonLoaderDiv,
    loaderComponent;

  categorySpan = document.createElement("span");
  categorySpan.setAttribute("class", "poll-dash-tags poll-dash-tags-ctgry");
  categorySpan.innerText = data.category;

  votesSpan = document.createElement("span");
  votesSpan.setAttribute("class", "poll-dash-tags poll-dash-tags-votes");
  votesSpan.innerText = data.votes + " Votes";

  headerDiv = document.createElement("div");
  headerDiv.setAttribute("class", "mB10");
  headerDiv.appendChild(categorySpan);
  headerDiv.appendChild(votesSpan);

  contentLabel = document.createElement("h4");
  contentLabel.setAttribute("class", "poll-dash-header");
  contentLabel.innerText = data.content;
  if (data.ended) {
    durationLabel = document.createElement("h6");
    durationLabel.setAttribute("class", "poll-dash-timer");
    durationLabel.innerText =
      "ENDED ON: " + moment(data.duration).format("D MMM YYYY,HH:mm");

  } else {
    timeSpan = document.createElement("span");
    timeSpan.setAttribute("name", "time");
    timeSpan.setAttribute("index", data.id);
    timeSpan.setAttribute("duration", data.duration);
    timeSpan.setAttribute("id", `time_${data.id}`);
    timeSpan.innerText = calculateDifferenceBetweenDates(
      data.duration
    ).formattedDate;

    durationLabel = document.createElement("h6");
    durationLabel.setAttribute("class", "poll-dash-timer");
    durationLabel.innerText = "ENDS IN: ";
    durationLabel.appendChild(timeSpan);
  }

  otherUsersVotes = document.createElement("span");
  otherUsersVotes.setAttribute("class", "float-right");
  otherUsersVotes.innerText = data.userVotedPollVotes + " votes";

  userVoteHeader = document.createElement("h6");
  userVoteHeader.innerText = "YOUR VOTE FOR";
  userVoteHeader.appendChild(otherUsersVotes);

  userVote = document.createElement("p");
  userVote.innerText = data.userVotedPoll;

  pollResultDiv = document.createElement("div");
  pollResultDiv.setAttribute("class", "my-vote-snippet");
  pollResultDiv.appendChild(userVoteHeader);
  pollResultDiv.appendChild(userVote);

  loaderComponent = loader("22px", "none", true, false, data.id);

  viewDetailedResults = document.createElement("button");
  viewDetailedResults.setAttribute(
    "class",
    "pollapp-button button-primary-hollow"
  );
  viewDetailedResults.setAttribute("index", data.id);
  viewDetailedResults.innerText = "View Result";
  viewDetailedResults.addEventListener("click", (event) => {
    getPollDetails(event.currentTarget);
  });

  buttonLoaderDiv = document.createElement("div");
  buttonLoaderDiv.style.display = "flex";
  buttonLoaderDiv.appendChild(viewDetailedResults);
  buttonLoaderDiv.appendChild(loaderComponent);

  childDiv = document.createElement("div");
  childDiv.setAttribute("class", "poll-dashboard my-votes-dashboard");
  childDiv.appendChild(headerDiv);
  childDiv.appendChild(contentLabel);
  childDiv.appendChild(durationLabel);
  // childDiv.appendChild(pollResultDiv);
  childDiv.appendChild(buttonLoaderDiv);

  parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "col-lg-4 col-md-6 remove-padding");
  parentDiv.appendChild(childDiv);

  return parentDiv;
}

//Edit Card
function generateEditCard(data) {
  let categorySpan, votesSpan, headerDiv;
  let contentLabel,
    durationLabel,
    deletePollButton,
    updatePollButton,
    buttonGroupDiv,
    childDiv,
    parentDiv,
    timeSpan;

  categorySpan = document.createElement("span");
  categorySpan.setAttribute("class", "poll-dash-tags poll-dash-tags-ctgry");
  categorySpan.innerText = data.category;

  votesSpan = document.createElement("span");
  votesSpan.setAttribute("class", "poll-dash-tags poll-dash-tags-votes");
  votesSpan.innerText = data.votes + " Votes";

  headerDiv = document.createElement("div");
  headerDiv.setAttribute("class", "mB10");
  headerDiv.appendChild(categorySpan);
  headerDiv.appendChild(votesSpan);

  contentLabel = document.createElement("h4");
  contentLabel.setAttribute("class", "poll-dash-header");
  contentLabel.setAttribute("id", "header" + data.id);
  contentLabel.innerText = data.content;

  timeSpan = document.createElement("span");
  timeSpan.setAttribute("name", "time");
  timeSpan.setAttribute("index", data.id);
  timeSpan.setAttribute("id", `time_${data.id}`);
  timeSpan.setAttribute("duration", data.duration);
  timeSpan.innerText = calculateDifferenceBetweenDates(
    data.duration
  ).formattedDate;

  durationLabel = document.createElement("h6");
  durationLabel.setAttribute("class", "poll-dash-timer");
  durationLabel.innerText = "ENDS IN: ";
  durationLabel.appendChild(timeSpan);

  deletePollButton = document.createElement("button");
  deletePollButton.setAttribute("class", "pollapp-button button-secondary");
  deletePollButton.setAttribute("index", data.id);
  deletePollButton.innerText = "Delete Poll";

  deletePollButton.addEventListener("click", (event) => {
    openDeleteDialog(event.target);
  });

  updatePollButton = document.createElement("button");
  updatePollButton.setAttribute(
    "class",
    "pollapp-button button-primary-hollow float-right"
  );
  updatePollButton.setAttribute("index", data.id);
  updatePollButton.innerText = "Change End Time";
  updatePollButton.addEventListener("click", (event) => {
    openEditDialog(event.target);
  });

  buttonGroupDiv = document.createElement("div");
  buttonGroupDiv.setAttribute("class", "my-polls-snippet");
  buttonGroupDiv.appendChild(deletePollButton);
  buttonGroupDiv.appendChild(updatePollButton);

  childDiv = document.createElement("div");
  childDiv.appendChild(headerDiv);
  childDiv.setAttribute("class", "poll-dashboard");
  childDiv.appendChild(contentLabel);
  childDiv.appendChild(durationLabel);
  childDiv.appendChild(buttonGroupDiv);

  parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "col-lg-4 col-md-6 remove-padding");
  parentDiv.appendChild(childDiv);

  return parentDiv;
}

// Load Ended Card
function generateEndedCard(data) {
  let categorySpan, votesSpan, headerDiv;
  let contentLabel, durationLabel, childDiv, parentDiv;
  let pollDiv,
    percentage = 0,
    pollTitle,
    pollTitleSpan,
    viewDetailedResults,
    buttonLoaderDiv,
    loaderComponent;

  categorySpan = document.createElement("span");
  categorySpan.setAttribute("class", "poll-dash-tags poll-dash-tags-ctgry");
  categorySpan.innerText = data.category;

  votesSpan = document.createElement("span");
  votesSpan.setAttribute("class", "poll-dash-tags poll-dash-tags-votes");
  votesSpan.innerText = data.votes + " Votes";

  headerDiv = document.createElement("div");
  headerDiv.setAttribute("class", "mB10");
  headerDiv.appendChild(categorySpan);
  headerDiv.appendChild(votesSpan);

  contentLabel = document.createElement("h4");
  contentLabel.setAttribute("class", "poll-dash-header");
  contentLabel.innerText = data.content;

  durationLabel = document.createElement("h6");
  durationLabel.setAttribute("class", "poll-dash-timer");
  durationLabel.innerText =
    "ENDED ON: " + moment(data.duration).format("D MMM YYYY,HH:mm");

  pollDiv = document.createElement("div");

  if (parseInt(data.votes)) {
    percentage = parseInt(data.maxVotedPollVotes) / parseInt(data.votes);
    percentage *= 100;
    percentage = Math.round(percentage);
  }

  pollTitleSpan = document.createElement("span");
  pollTitleSpan.innerText = percentage + "%";

  pollTitle = document.createElement("h6");
  pollTitle.innerText = data.maxVotedPoll;
  pollTitle.appendChild(pollTitleSpan);

  pollDiv.setAttribute("class", "poll-answershown-wrap user-selected-green");
  pollDiv.appendChild(pollTitle);

  colorSpan = document.createElement("span");
  colorSpan.style.width = `${percentage}%`;

  pollPercentageDiv = document.createElement("div");
  pollPercentageDiv.setAttribute("class", `vote-percentage-wrap perc-green`);
  pollPercentageDiv.appendChild(colorSpan);

  votesSpan = document.createElement("span");
  votesSpan.innerText = `${data.maxVotedPollVotes} votes`;

  pollDiv.appendChild(pollPercentageDiv);
  pollDiv.appendChild(votesSpan);

  loaderComponent = loader("22px", "none", true, false, data.id);

  viewDetailedResults = document.createElement("button");
  viewDetailedResults.setAttribute(
    "class",
    "pollapp-button button-primary-hollow"
  );
  viewDetailedResults.innerText = "View Results";
  viewDetailedResults.setAttribute("index", data.id);

  viewDetailedResults.addEventListener("click", (event) => {
    getPollDetails(event.currentTarget);
  });

  buttonLoaderDiv = document.createElement("div");
  buttonLoaderDiv.style.display = "flex";
  buttonLoaderDiv.appendChild(viewDetailedResults);
  buttonLoaderDiv.appendChild(loaderComponent);

  childDiv = document.createElement("div");
  childDiv.setAttribute("class", "poll-dashboard my-votes-dashboard");
  childDiv.appendChild(headerDiv);
  childDiv.appendChild(contentLabel);
  childDiv.appendChild(durationLabel);
  // childDiv.appendChild(pollDiv);
  childDiv.appendChild(buttonLoaderDiv);

  parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "col-lg-4 col-md-6 remove-padding");
  parentDiv.appendChild(childDiv);

  return parentDiv;
}

async function generateCards(choice) {
  $("#polls").html(loader("3rem", "block", false, true, false, false, true));
  let i;
  let status, data, pages, user_id, url, checkBox;
  let elements = [];

  if (JSON.stringify(userData) === JSON.stringify({})) {
    userData = await getCurrentUserData();
  }

  user_id = userData.user_id;

  if (choice !== "MyVotes") {
    checkBox = $("#checkBoxInput").is(":checked");
    if (checkBox) {
      if (choice === "AllPolls") {
        url = `/server/poll_service/${choice}/Completed`;
      } else {
        url = `/server/poll_service/${choice}/Ended`;
      }
    } else {
      url = `/server/poll_service/${choice}`;
    }
  } else {
    url = `/server/poll_service/${choice}`;
  }

  // if (choice !== "MyVotes") {
  //     checkBox = $("#checkBoxInput").is(":checked");
  //     if (checkBox) {
  //         if (choice === "AllPolls") {
  //             url = `/server/poll_service_java/${choice}/Completed`;
  //         }
  //         else {
  //             url = `/server/poll_service_java/${choice}/Ended`;
  //         }
  //     } else {
  //         url = `/server/poll_service_java/${choice}`
  //     }
  // } else {
  //     url = `/server/poll_service_java/${choice}`
  // }

  var settings = {
    url: url,
    method: "POST",
    headers: {
      "content-type": "application/json",
    },

    data: JSON.stringify({
      user_id,
      page: currentPage,
    }),
  };

  $.ajax(settings)
    .then((response) => {
      // response = JSON.parse(response);
      status = response.status;
      data = response.data;
      pages = response.totalPage;
      currentPage = response.currentPage;
      if (status) {
        for (i = 0; i < data.length; i++) {
          if (data[i].edited) {
            if (data[i].ended) {
              elements.push(generateEndedCard(data[i]));
            } else {
              elements.push(generateEditCard(data[i]));
            }
          } else {
            if (data[i].voted || data[i].ended) {
              elements.push(generateVotedCard(data[i]));
            } else {
              elements.push(generateVoteCard(data[i]));
            }
          }
        }

        if (!data.length) {
          if (choice !== "MyVotes") {
            checkBox = $("#checkBoxInput").is(":checked");
            if (checkBox) {
              if (choice === "AllPolls") {
                elements.push(
                  showNoPolls(
                    `No Completed <span class="pollColor">Polls</span> , Vote on a poll`
                  )
                );
              } else {
                elements.push(
                  showNoPolls(
                    `No Ended <span class="pollColor">Polls</span> , Create a poll`
                  )
                );
              }
            } else {
              elements.push(
                showNoPolls(
                  `No <span class="pollColor">Polls</span> Yet , Create a poll`
                )
              );
            }
          } else {
            elements.push(
              showNoPolls(
                `No <span class="pollColor">Polls</span> Yet , Vote on a Poll`
              )
            );
          }
        }

        loadPagination(pages);
      }

      $("#polls").html(elements);

      setInterval(() => {
        realTimeTimer();
      }, 1000);
    })
    .catch((err) => {
      console.log(err);
    });
}

function getClassNames(percentage) {
  if (percentage >= 80) return "perc-green";
  else if (percentage >= 60) {
    return "perc-blue";
  } else if (percentage >= 20) {
    return "perc-yellow";
  }
  return "perc-red";
}

//Load the preview image
function loadPreviewImage(event) {
  let appendFlag = false;
  let previewImageDiv = document.getElementById(`${event.target.name}Preview`);
  let image = document.getElementById(`${event.target.name}PreviewContent`);
  if (!image) {
    appendFlag = true;
    image = document.createElement("img");
    image.id = `${event.target.name}PreviewContent`;
  }
  image.src = URL.createObjectURL(event.target.files[0]);
  image.onload = function () {
    URL.revokeObjectURL(image.src); // free memory
  };

  if (appendFlag) {
    previewImageDiv.appendChild(image);
  }
}
//Load the default options
function loadDefaultPollOptions() {
  let i;
  let elements = [];
  for (i = 1; i < 5; i++) {
    let parentDiv = document.createElement("div");
    parentDiv.setAttribute("name", "Options");
    parentDiv.setAttribute("class", "input-group mB20");

    let label = document.createElement("h6");
    label.innerText = `Enter poll option ${i}`;

    let input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Option ${i}`;
    input.name = `Option${i}Content`;
    input.id = `Option${i}Content`;
    input.required = true;

    let previewImage = document.createElement("div");
    previewImage.setAttribute("class", "add-image-holder mT10");
    previewImage.setAttribute("id", `Option${i}ImagePreview`);

    let imageUpload = document.createElement("div");
    imageUpload.setAttribute("class", "text-right mT10");
    imageUpload.setAttribute("id", `Option${i}ImageUpload`);

    let addImageLabel = document.createElement("label");
    addImageLabel.setAttribute("class", "add-image");
    addImageLabel.innerText = `+ Add Image`;

    let addImageInput = document.createElement("input");
    addImageInput.type = "file";
    addImageInput.accept = "image/*";
    addImageInput.name = `Option${i}Image`;
    addImageInput.id = `Option${i}Image`;
    addImageInput.addEventListener("change", (event) => {
      loadPreviewImage(event);
    });

    addImageLabel.append(addImageInput);
    imageUpload.append(addImageLabel);
    parentDiv.appendChild(label);
    parentDiv.appendChild(input);
    parentDiv.appendChild(previewImage);
    parentDiv.appendChild(imageUpload);
    elements.push(parentDiv);
  }

  return elements;
}
// load Question
function loadDefaultQuestion() {
  let parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "input-group mB20");

  let label = document.createElement("h6");
  label.innerText = `Enter a poll question`;

  let input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Eg: What is your favourite game?`;
  input.name = `QuestionContent`;
  input.id = `QuestionContent`;
  input.required = true;

  let previewImage = document.createElement("div");
  previewImage.setAttribute("class", "add-image-holder mT10");
  previewImage.setAttribute("id", `QuestionImagePreview`);

  let imageUpload = document.createElement("div");
  imageUpload.setAttribute("class", "text-right mT10");
  imageUpload.setAttribute("id", `QuestionImageUpload`);

  let addImageLabel = document.createElement("label");
  addImageLabel.setAttribute("class", "add-image");
  addImageLabel.innerText = `+ Add Image`;

  let addImageInput = document.createElement("input");
  addImageInput.type = "file";
  addImageInput.accept = "image/*";
  addImageInput.name = `QuestionImage`;
  addImageInput.id = `QuestionImage`;
  addImageInput.addEventListener("change", (event) => {
    loadPreviewImage(event);
  });

  addImageLabel.append(addImageInput);
  imageUpload.append(addImageLabel);
  parentDiv.appendChild(label);
  parentDiv.appendChild(input);
  parentDiv.appendChild(previewImage);
  parentDiv.appendChild(imageUpload);
  return parentDiv;
}

// Load Created Poll Data
async function loadCreatedPoll(data) {
  let timeSpan;
  let durationLabel;
  let pollQuestion;
  let pollQuestionImage;
  let image;
  let pollAndPollOptionContainer;
  let createdBy;
  let i;
  let pollOption;
  let pollOptionImage;
  let pollOptionInput;
  let pollOptionLabelDiv;
  let pollOptionLabel;
  let voteButton,
    footer,
    header,
    title,
    bottomDiv,
    homeButton,
    createButton,
    loaderComponent;

  title = document.createElement("h4");
  title.innerText = "Your poll has been successfully created";
  title.setAttribute("class", "poll-jumbotron-heade");

  header = document.createElement("div");
  header.setAttribute("class", "mB30");
  header.appendChild(title);

  timeSpan = document.createElement("span");
  timeSpan.setAttribute("name", "time");
  timeSpan.setAttribute("index", data.id);
  timeSpan.setAttribute("duration", data.duration);
  timeSpan.setAttribute("id", `time_${data.id}`);
  timeSpan.innerText = calculateDifferenceBetweenDates(
    data.duration
  ).formattedDate;

  durationLabel = document.createElement("h6");
  durationLabel.setAttribute("class", "poll-dash-timer poll-created-timer");
  durationLabel.innerText = "ENDS IN: ";
  durationLabel.appendChild(timeSpan);

  pollQuestion = document.createElement("div");
  pollQuestion.setAttribute("class", "poll-jumbotron-header");
  pollQuestion.innerText = data.content;

  if (data.file_id) {
    image = document.createElement("img");
    image.src = `https://${document.domain}/server/poll_service/imageLoader/${data.file_id}`;

    pollQuestionImage = document.createElement("div");
    pollQuestionImage.setAttribute("class", "poll-question-image-holder");
    pollQuestionImage.appendChild(image);
  }

  createdBy = document.createElement("h6");
  createdBy.setAttribute("class", "poll-meta-data");
  createdBy.innerText = "Created by : " + data.created_by;

  pollAndPollOptionContainer = document.createElement("div");
  pollAndPollOptionContainer.setAttribute("class", "create-poll-wrap");
  pollAndPollOptionContainer.appendChild(durationLabel);
  pollAndPollOptionContainer.appendChild(pollQuestion);
  if (data.file_id) {
    pollAndPollOptionContainer.appendChild(pollQuestionImage);
  }
  pollAndPollOptionContainer.appendChild(createdBy);

  for (i = 0; i < data.options.length; i++) {
    pollOptionInput = document.createElement("input");
    pollOptionInput.type = "radio";
    pollOptionInput.value = data.options[i].id;
    pollOptionInput.setAttribute("name", "pollOption");

    pollOptionLabel = document.createElement("span");
    pollOptionLabel.setAttribute("class", "poll-answer");
    pollOptionLabel.innerText = data.options[i].content;

    pollOptionLabelDiv = document.createElement("div");
    pollOptionLabelDiv.setAttribute("class", "mL30");
    pollOptionLabelDiv.style.marginBottom = "10px";
    pollOptionLabelDiv.appendChild(pollOptionLabel);

    if (data.options[i].file_id) {
      image = document.createElement("img");
      image.src = `https://${document.domain}/server/poll_service/imageLoader/${data.options[i].file_id}`;

      pollOptionImage = document.createElement("div");
      pollOptionImage.setAttribute("class", "poll-question-image-holder");
      pollOptionImage.appendChild(image);
    }

    pollOption = document.createElement("label");
    pollOption.setAttribute("class", "poll-answer-wrap");
    pollOption.appendChild(pollOptionInput);
    pollOption.appendChild(document.createElement("span"));
    pollOption.appendChild(pollOptionLabelDiv);

    if (data.options[i].file_id) {
      pollOption.appendChild(pollOptionImage);
    }

    pollAndPollOptionContainer.appendChild(pollOption);
  }

  loaderComponent = loader("20px", "none", true, false, "vote");

  voteButton = document.createElement("button");
  voteButton.setAttribute("class", "pollapp-button button-primary");
  voteButton.innerText = "Vote";
  voteButton.setAttribute("index", data.id);
  voteButton.addEventListener("click", (event) => {
    saveVote(event.target);
  });

  footer = document.createElement("div");
  footer.setAttribute("class", "mT40 d-flex");
  footer.appendChild(voteButton);
  footer.appendChild(loaderComponent);

  pollAndPollOptionContainer.appendChild(footer);

  homeButton = document.createElement("button");
  homeButton.setAttribute("class", "pollapp-button button-primary-hollow mR30");
  homeButton.innerText = "Home";
  homeButton.addEventListener("click", () => {
    showContent("home");
  });

  createButton = document.createElement("button");
  createButton.setAttribute("class", "pollapp-button button-primary-hollow");
  createButton.innerText = "Create poll";
  createButton.addEventListener("click", () => {
    showContent("create_poll");
  });

  bottomDiv = document.createElement("div");
  bottomDiv.setAttribute("class", "mT30");
  bottomDiv.appendChild(homeButton);
  bottomDiv.appendChild(createButton);

  let parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "container maxW625 mT50");
  parentDiv.appendChild(header);
  parentDiv.appendChild(pollAndPollOptionContainer);
  parentDiv.appendChild(bottomDiv);

  $("#displayContent").html(parentDiv);
}
// Load the poll details
async function getPollVoteData(element) {
  let id = element.getAttribute("index");
  element.disabled = true;
  $(`#loader_${id}`).css("display", "block");
  let status = false;
  let data = {};
  var settings = {
    url: "/server/poll_service/getPoll",
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    data: JSON.stringify({
      id,
    }),
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

  $.ajax(settings).done(function (response) {
    // response = JSON.parse(response);
    status = response.status;
    data = response.data;
    if (status) {
      loadVotePage(data);
    }
  });
}

//No Polls

function showNoPolls(message) {
  let parentDiv = document.createElement("div");
  parentDiv.setAttribute("class", "noPollsContainer");

  let messageDiv = document.createElement("div");
  messageDiv.innerHTML = message;
  parentDiv.appendChild(messageDiv);

  return parentDiv;
}

async function saveVote(element) {
  let poll_id = element.getAttribute("index");
  let pollOptions = document.getElementsByName("pollOption");
  let i,
    status = false,
    data = {};
  let poll_option_id = "";
  for (i = 0; i < pollOptions.length; i++) {
    if (pollOptions[i].checked) {
      poll_option_id = pollOptions[i].value;
    }
  }

  if (poll_option_id) {
    element.disabled = true;
    $("#loader_vote").css("display", "block");
    var settings = {
      url: "/server/poll_service/saveVote",
      method: "POST",
      headers: {
        "content-type": "application/json",
      },

      data: JSON.stringify({
        poll_id,
        poll_option_id,
        user_id: userData.user_id,
      }),
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
    //         user_id: userData.user_id
    //     })
    // }

    $.ajax(settings)
      .then(function (response) {
        // response = JSON.parse(response);
        status = response.status;
        data = response.data;
        if (status) {
          console.log(data);
          loadVotedPoll({
            ...data,
            poll_id,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Internal Server Error Alert Occured");
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
  let i;
  let pollOption,
    pollOptionImage;
  let pollOptionInput;
  let pollOptionLabelDiv;
  let pollOptionLabel;
  let voteButton, footer, loaderComponent, endedContainer, endedContent, homeButton, resultButton;
  let temp = calculateDifferenceBetweenDates(data.duration);
  if (!temp.days && !temp.hours && !temp.minutes && !temp.seconds) {
    endedContainer = document.createElement("div");
    endedContainer.setAttribute("class", "alignCenter ended-poll")

    endedContent = document.createElement("h3");
    endedContent.innerText = "Poll has been ended";

    homeButton = document.createElement("button");
    homeButton.setAttribute("class", "pollapp-button button-secondary mR30");
    homeButton.innerText = "Home";
    homeButton.addEventListener("click", () => {
      showContent("home");
    });
    resultButton = document.createElement("button");
    resultButton.setAttribute("class", "pollapp-button button-primary");
    resultButton.setAttribute("index", poll_id)
    resultButton.innerText = "View Result";
    resultButton.addEventListener("click", (event) => {
      getPollDetails(event.currentTarget);
    });

    footer = document.createElement("div");
    footer.setAttribute("class", "mT40 d-flex");
    footer.appendChild(homeButton);
    footer.appendChild(resultButton);

    endedContainer.appendChild(endedContent);
    endedContainer.appendChild(footer);
    $("#displayContent").html(endedContainer);
  } else {
    timeSpan = document.createElement("span");
    timeSpan.setAttribute("name", "time");
    timeSpan.setAttribute("index", data.id);
    timeSpan.setAttribute("duration", data.duration);
    timeSpan.setAttribute("id", `time_${data.id}`);
    timeSpan.innerText = temp.formattedDate;

    durationLabel = document.createElement("h6");
    durationLabel.setAttribute("class", "poll-dash-timer poll-created-timer");
    durationLabel.innerText = "ENDS IN: ";
    durationLabel.appendChild(timeSpan);

    pollQuestion = document.createElement("div");
    pollQuestion.setAttribute("class", "poll-jumbotron-header");
    pollQuestion.innerText = data.content;

    if (data.file_id) {
      image = document.createElement("img");
      image.src = `https://${document.domain}/server/poll_service/imageLoader/${data.file_id}`;

      pollQuestionImage = document.createElement("div");
      pollQuestionImage.setAttribute("class", "poll-answer-image-holder");
      pollQuestionImage.appendChild(image);
    }

    createdBy = document.createElement("h6");
    createdBy.setAttribute("class", "poll-meta-data");
    createdBy.innerText = `Created by : ${data.created_by}`;

    pollAndPollOptionContainer = document.createElement("div");
    pollAndPollOptionContainer.setAttribute("class", "create-poll-wrap");
    pollAndPollOptionContainer.appendChild(durationLabel);
    pollAndPollOptionContainer.appendChild(pollQuestion);
    if (data.file_id) {
      pollAndPollOptionContainer.appendChild(pollQuestionImage);
    }
    pollAndPollOptionContainer.appendChild(createdBy);

    for (i = 0; i < data.options.length; i++) {
      pollOptionInput = document.createElement("input");
      pollOptionInput.type = "radio";
      pollOptionInput.value = data.options[i].id;
      pollOptionInput.setAttribute("name", "pollOption");

      pollOptionLabel = document.createElement("span");
      pollOptionLabel.setAttribute("class", "poll-answer");
      pollOptionLabel.innerText = data.options[i].content;

      pollOptionLabelDiv = document.createElement("div");
      pollOptionLabelDiv.setAttribute("class", "mL30");
      pollOptionLabelDiv.appendChild(pollOptionLabel);

      if (data.options[i].file_id) {
        image = document.createElement("img");
        image.src = `https://${document.domain}/server/poll_service/imageLoader/${data.options[i].file_id}`;
        pollOptionImage = document.createElement("div");
        pollOptionImage.setAttribute("class", "poll-answer-image-holder");
        pollOptionImage.appendChild(image);
      }

      pollOption = document.createElement("label");
      pollOption.setAttribute("class", "poll-answer-wrap");
      pollOption.appendChild(pollOptionInput);
      pollOption.appendChild(document.createElement("span"));
      pollOption.appendChild(pollOptionLabelDiv);

      if (data.options[i].file_id) {
        pollOption.appendChild(pollOptionImage);
      }

      pollAndPollOptionContainer.appendChild(pollOption);
    }

    voteButton = document.createElement("button");
    voteButton.setAttribute("class", "pollapp-button button-primary");
    voteButton.innerText = "Vote";
    voteButton.setAttribute("index", data.id);
    voteButton.addEventListener("click", (event) => {
      saveVote(event.target);
    });
    loaderComponent = loader("18px", "none", true, false, "vote");

    let cancelButton = document.createElement("button");
    cancelButton.setAttribute("class", "pollapp-button button-secondary mR30");
    cancelButton.setAttribute("id", "cancelPoll");
    cancelButton.innerText = "Cancel";
    cancelButton.addEventListener("click", () => {
      showContent("home");
    });

    footer = document.createElement("div");
    footer.setAttribute("class", "mT40 d-flex");
    footer.appendChild(cancelButton);
    footer.appendChild(voteButton);
    footer.appendChild(loaderComponent);

    pollAndPollOptionContainer.appendChild(footer);

    let parentDiv = document.createElement("div");
    parentDiv.setAttribute("class", "container maxW625 mT50");
    parentDiv.appendChild(pollAndPollOptionContainer);

    $("#displayContent").html(parentDiv);
  }
}

function loadPagination(pages) {
  if (pages > 1) {
    let navigation, unorderedList, icon, title, pageItems, buttonTag, i;
    navigation = document.createElement("nav");

    unorderedList = document.createElement("ul");
    unorderedList.setAttribute("class", "pagination");

    buttonTag = document.createElement("button");
    buttonTag.setAttribute("class", "page-link");
    buttonTag.setAttribute("pageNumber", currentPage - 1);
    buttonTag.setAttribute("totalPages", pages);
    buttonTag.addEventListener("click", (event) => {
      changePage(event.target);
    });
    buttonTag.innerText = "<";

    pageItems = document.createElement("li");
    if (currentPage !== 1) {
      pageItems.setAttribute("class", "page-item page-num");
    } else {
      pageItems.setAttribute("class", "page-item page-num disabled");
    }
    pageItems.appendChild(buttonTag);

    unorderedList.appendChild(pageItems);

    for (i = 1; i <= pages; i++) {
      buttonTag = document.createElement("button");
      buttonTag.setAttribute("pageNumber", i);
      buttonTag.setAttribute("currentPage", currentPage);
      buttonTag.setAttribute("totalPages", pages);
      buttonTag.addEventListener("click", (event) => {
        changePage(event.target);
      });

      if (i === currentPage) {
        buttonTag.setAttribute("class", "page-link");
        buttonTag.style.color = "blue";
      } else {
        buttonTag.setAttribute("class", "page-link");
      }
      buttonTag.innerText = i;

      pageItems = document.createElement("li");
      pageItems.setAttribute("class", "page-item ");
      pageItems.appendChild(buttonTag);
      unorderedList.appendChild(pageItems);
    }

    buttonTag = document.createElement("button");
    buttonTag.setAttribute("class", "page-link");
    buttonTag.setAttribute("class", "page-link");
    buttonTag.setAttribute("pageNumber", currentPage + 1);
    buttonTag.setAttribute("currentPage", currentPage);
    buttonTag.setAttribute("totalPages", pages);
    buttonTag.addEventListener("click", (event) => {
      changePage(event.target);
    });
    buttonTag.innerText = ">";

    pageItems = document.createElement("li");
    if (currentPage !== pages) {
      pageItems.setAttribute("class", "page-item page-num");
    } else {
      pageItems.setAttribute("class", "page-item page-num disabled");
    }
    pageItems.appendChild(buttonTag);

    unorderedList.appendChild(pageItems);

    navigation.appendChild(unorderedList);

    $("#pagination").html(navigation);
  } else {
    $("#pagination").html("<div></div>");
  }
}

function changePage(element) {
  let totalPage = parseInt(element.getAttribute("totalPages"));
  let pageNumber = parseInt(element.getAttribute("pageNumber"));

  if (currentPage !== pageNumber && pageNumber <= totalPage) {
    currentPage = pageNumber;
    generateCards(previousTab);
  }
}

function loader(dimension, display, float, center, id, color, home) {
  let spinnerParentDiv = document.createElement("span");
  if (center) {
    spinnerParentDiv.setAttribute("class", "d-flex justify-content-center");
    spinnerParentDiv.style.width = "100%";
    spinnerParentDiv.style.height = "100%";
  }

  var spinnerDiv = document.createElement("span");

  spinnerDiv.style.height = dimension;
  spinnerDiv.style.width = dimension;

  if (color) {
    spinnerDiv.style.color = color;
  } else {
    spinnerDiv.style.color = "#6267F5";
  }
  spinnerDiv.style.display = display;

  if (float) {
    spinnerDiv.setAttribute("class", "spinner-border float-right");
    spinnerDiv.style.margin = "10px 15px";
  } else if (home) {
    spinnerDiv.setAttribute("class", "spinner-border home");
  } else {
    spinnerDiv.setAttribute("class", "spinner-border");
  }
  if (id) {
    spinnerDiv.setAttribute("id", "loader_" + id);
  }
  spinnerParentDiv.appendChild(spinnerDiv);

  return spinnerParentDiv;
}
