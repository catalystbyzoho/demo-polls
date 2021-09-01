const catalystSDK = require('zcatalyst-sdk-node')
const moment = require('moment')
const fs = require('fs');
const files = {
    '2706000000112076.jpeg': '',
    '2706000000115056.jpg': '',
    '2706000000115061.jpg': '',
    '2706000000115066.jpg': '',
    '2706000000115071.jpg': '',
    '2706000000112071.jpg': '',
    '2706000000115036.jpg': '',
    '2706000000115041.png': '',
    '2706000000115046.jpeg': '',
    '2706000000115051.jpg': '',
    '2706000000112065.jpeg': '',
    '2706000000115076.jpg': '',
    '2706000000115081.jpg': '',
    '2706000000115086.jpg': '',
    '2706000000115091.jpg': ''
}


const data = [
    {

        "content": "Which country hosted the 2020 Winter Youth Olympics?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "Switzerland",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Austria",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Russia",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Canada",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Who is your favourite football player ?",
        "category": "Sports",
        "file_name": "2706000000112076.jpeg",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "Messi",
            "file_name": "2706000000115056.jpg",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Mardona",
            "file_name": "2706000000115061.jpg",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "David Beckham",
            "file_name": "2706000000115066.jpg",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Ronaldo",
            "file_name": "2706000000115071.jpg",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Who is the only player to have scored a hat-trick in a world cup final?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "Pele",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "David Bekham",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Gerd Muller",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Gerd Hurst",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Who was first president of BCCI?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "R.E. Grant Govan",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Dr. Maharajkumar Sir Vijaya Ananda",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Sikandar Hyat Khan",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Anthony S.D'Mello",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Which Indian cricketer has bagged a deal with ESPN?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "Md kaif",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Yuvraj",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Sachin Tendulkar",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Anil Kumble",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Who is the only cricketer to score two successive centuries in a world cup?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{

            "poll_id": "",
            "content": "Rahul Dravid",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Sachin Tendulkar",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Surav Ganguly",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Virender Sehwag",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Which were the participating countries of “The Ashes” test cricket series?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "New Zealand Vs Australia",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "England Vs Australia",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "England Vs New Zealand",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "India vs England",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "In which world cup, India won its second “Cricket World Cup Champion” title?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "2003 Cricket World Cup",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "2007 Cricket World Cup",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "2011 Cricket World Cup",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "2015 Cricket World Cup",
            "file_id": "",
            "votes": 0
        },]
    },
    {

        "content": "Which of the following country hosted the first Football World Cup?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "America",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Argentina",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Brazil",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Uruguay",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Which country became the first nation to win the Football World Cup?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [
            {
                "poll_id": "",
                "content": "Uruguay",
                "file_id": "",
                "votes": 0
            },
            {
                "poll_id": "",
                "content": "Belgium",
                "file_id": "",
                "votes": 0
            },
            {

                "poll_id": "",
                "content": "Germany",
                "file_id": "",
                "votes": 0
            },
            {
                "poll_id": "",
                "content": "Argentina",
                "file_id": "",
                "votes": 0
            }
        ]
    },
    {

        "content": "What is your hobby ?",
        "category": "Books",
        "file_name": "2706000000112071.jpg",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{

            "poll_id": "",
            "content": "Listening to music",
            "file_name": "2706000000115036.jpg",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Sports",
            "file_name": "2706000000115041.png",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Dance",
            "file_name": "2706000000115046.jpeg",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Reading books",
            "file_name": "2706000000115051.jpg",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "The 2017 Indian Premier League (IPL 2017) first match on 5 April, 2017 was held in ?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "Delhi",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Kolkata",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Hyderabad",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Bangalore",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Which one of the following Cricketers has been declared by the ICC as 'Cricketer of the Twentieth Century '?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{

            "poll_id": "",
            "content": "Sachin Tendulkar",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Rahul Dravid",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Kapil Dev",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Anil Kumble",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Which was the 1st non test playing country to beat India in an international match",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{

            "poll_id": "",
            "content": "Sri Lanka",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "England",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Australia",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "New Zealand",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Which of the following International Tennis Tournaments is held on grass court?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "US open",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "French Open",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Wimbledon",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Australian Open",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Who was the Captain of India Men’s Hockey team in Rio Olympics 2016?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{

            "poll_id": "",
            "content": "Dilip Tirkey",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Ramandeep Singh",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "P.R. Sreejesh",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Pargat Singh",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "When was the first logo of Badminton World Federation officially launched?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [
            {

                "poll_id": "",
                "content": 2003,
                "file_id": "",
                "votes": 0
            },
            {

                "poll_id": "",
                "content": 2007,
                "file_id": "",
                "votes": 0
            },
            {

                "poll_id": "",
                "content": 2010,
                "file_id": "",
                "votes": 0
            },
            {

                "poll_id": "",
                "content": 2005,
                "file_id": "",
                "votes": 0
            }
        ]
    },
    {

        "content": "Who among the following player scores highest number of goals in Footbal World Cup?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{

            "poll_id": "",
            "content": "Jurgen Klinsmann",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Meradona",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Miroslave Klose",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Pele",
            "file_id": "",
            "votes": 0
        }]
    },
    {


        "content": "Which country ranked second in the International Kabaddi Federation’s top 10 Kabaddi teams?",
        "category": "Sports",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{

            "poll_id": "",
            "content": "Iran",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "India",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Pakistan",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Thailand",
            "file_id": "",
            "votes": 0
        }]
    },
    {

        "content": "Who is the favourite crickter",
        "category": "Sports",
        "file_name": "2706000000112065.jpeg",
        "file_id": "",
        "votes": 0,
        "created_by": "Emma Zylker",
        "pollOptions": [{
            "poll_id": "",
            "content": "Dhoni",
            "file_name": "2706000000115076.jpg",
            "file_id": "",
            "votes": 0
        },
        {
            "poll_id": "",
            "content": "Virat Kohli",
            "file_name": "2706000000115081.jpg",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Sachin",
            "file_name": "2706000000115086.jpg",
            "file_id": "",
            "votes": 0
        },
        {

            "poll_id": "",
            "content": "Smith",
            "file_name": "2706000000115091.jpg",
            "file_id": "",
            "votes": 0
        }]
    }
]
module.exports = async (context, basicIO) => {
    try {
        const start_time = new Date()
        const catalyst = catalystSDK.initialize(context);
        const filestore = catalyst.filestore()
        const datastore = catalyst.datastore()
        const zcql = catalyst.zcql()
        const pollsTable = datastore.table("Polls")
        const pollOptionsTable = datastore.table("PollOptions")
        const currentTime = new Date()
        const currentOffset = currentTime.getTimezoneOffset();
        const ISTOffset = 330;
        const ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
        const availableFolders = await filestore.getAllFolders();
        let imagesFolderCreated = false
        let folderId = ""
        let query = "SELECT COUNT(Polls.ROWID) FROM Polls"
        let queryResponse, totalPolls, response
        let insertData = []
        let i, j, k

        availableFolders.forEach((item) => {
            item = JSON.parse(item);
            if (item.folder_name === "Images") {
                imagesFolderCreated = true
                folderId = item.id;
            }
        });

        if (!imagesFolderCreated) {
            let folderCreateResponse = await filestore.createFolder('Images');
            folderCreateResponse = JSON.parse(folderCreateResponse)
            folderId = folderCreateResponse.id
        }
        const folder = filestore.folder(folderId)
        queryResponse = await zcql.executeZCQLQuery(query)
        totalPolls = parseInt(queryResponse[0].Polls.ROWID)
        if (!totalPolls) {
            for (const file_name in files) {
                let config = {
                    code: fs.createReadStream(`./Images/${file_name}`),
                    name: file_name
                };
                let response = await folder.uploadFile(config)
                files[file_name] = response.id.toString()
            }
            data.forEach(item => {
                if (item.file_name) {
                    item.file_id = files[item.file_name]
                }

                insertData.push({
                    "content": item.content,
                    "duration": moment(ISTTime).add(10, 'days').format("YYYY-MM-DD HH:mm:ss"),
                    "category": item.category,
                    "file_id": item.file_id,
                    "votes": item.votes,
                    "created_by": item.created_by,
                })
            })

            response = await pollsTable.insertRows(insertData)
            insertData = []
            for (i = 0; i < response.length; i++) {
                let pollData = response[i]
                for (j = 0; j < data.length; j++) {
                    if (data[j].content === pollData.content) {
                        for (k = 0; k < data[j].pollOptions.length; k++) {
                            if (data[j].pollOptions[k].file_name) {
                                data[j].pollOptions[k].file_id = files[data[j].pollOptions[k].file_name]
                            }
                            insertData.push({
                                "poll_id": pollData.ROWID,
                                "content": data[j].pollOptions[k].content,
                                "file_id": data[j].pollOptions[k].file_id,
                                "votes": data[j].pollOptions[k].votes
                            })
                        }
                        break;
                    }
                }
            }
            await pollOptionsTable.insertRows(insertData)

        }
        const end_time = new Date()
        const time_diff = Math.abs(end_time.getTime() - start_time.getTime())
        basicIO.setStatus(200);
        basicIO.write("Total time : " + Math.ceil(time_diff / 1000))
        context.close()

    } catch (err) {
        console.log(err)
        basicIO.setStatus(500);
        basicIO.write("err")
        context.close()

    }

};

