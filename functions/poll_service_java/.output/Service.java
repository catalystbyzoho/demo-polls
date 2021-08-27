import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.TimeZone;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import com.catalyst.advanced.CatalystAdvancedIOHandler;
import com.zc.component.ZCUserDetail;
import com.zc.component.files.ZCFile;
import com.zc.component.files.ZCFolder;
import com.zc.component.object.ZCObject;
import com.zc.component.object.ZCRowObject;
import com.zc.component.object.ZCTable;
import com.zc.component.users.PlatformType;
import com.zc.component.users.ZCSignUpData;
import com.zc.component.users.ZCUser;
import com.zc.component.zcql.ZCQL;

public class Service implements CatalystAdvancedIOHandler {
	private static final Logger LOGGER = Logger.getLogger(Service.class.getName());
	private String GET = "GET";
	private String POST = "POST";
	private JSONObject responseData = null;
	private byte[] fileStream = null;

	@Override
	@SuppressWarnings("unchecked")
	public void runner(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String url = request.getRequestURI();
			String method = request.getMethod();
			if (url.equals("/AllPolls") && method.equals(POST)) {

				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String user_id = requestParameters.get("user_id").toString();
				Integer page = Integer.parseInt(requestParameters.get("page").toString());

				responseData = getAllPolls(user_id, page);
				responseData.remove("pollMap");

			} else if ((url.equals("/MyVotes") || url.equals("/AllPolls/Completed")) && method.equals(POST)) {

				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String user_id = requestParameters.get("user_id").toString();
				Integer page = Integer.parseInt(requestParameters.get("page").toString());
				responseData = getMyVotesOrCompletedPolls(user_id, page);
				responseData.remove("pollMap");

			} else if (url.equals("/MyPolls") && method.equals(POST)) {

				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String user_id = requestParameters.get("user_id").toString();
				Integer page = Integer.parseInt(requestParameters.get("page").toString());
				responseData = getMyPolls(user_id, page);
				responseData.remove("pollMap");

			} else if (url.equals("/MyPolls/Ended") && method.equals(POST)) {

				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String user_id = requestParameters.get("user_id").toString();
				Integer page = Integer.parseInt(requestParameters.get("page").toString());
				responseData = getMyPollsEnded(user_id, page);
				responseData.remove("pollMap");

			} else if (url.equals("/deletePoll") && method.equals(POST)) {

				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String poll_id = requestParameters.get("id").toString();
				responseData = deletePoll(poll_id);

			} else if (url.contains("/AllPolls/") && method.equals(GET)) {
				Integer page = Integer.parseInt(url.substring(url.lastIndexOf("/") + 1));
				responseData = getAllPollsGuest(page);
				responseData.remove("pollMap");

			} else if (url.contains("/register") && method.equals(POST)) {
				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String first_name = requestParameters.get("first_name").toString();
				String last_name = requestParameters.get("last_name").toString();
				String email_id = requestParameters.get("email_id").toString();
				responseData = registerUser(email_id, first_name, last_name,
						Long.parseLong(request.getHeader("x-zc-project-key")));

			} else if (url.contains("/imageLoader/") && method.equals(GET)) {
				Long file_id = Long.parseLong(url.substring(url.lastIndexOf("/") + 1));
				fileStream = downloadImage(file_id);
				response.setContentLength(fileStream.length);
				response.setContentType("image/png");

			} else if (url.equals("/pollDetails") && method.equals(POST)) {
				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String poll_id = requestParameters.get("id").toString();

				String user_id = requestParameters.getOrDefault("user_id", "").toString();
				if (user_id.isEmpty()) {
					responseData = getPollDetails(poll_id);
				} else {
					responseData = getPollDetails(poll_id, user_id);
				}
			} else if (url.equals("/updatePoll") && method.equals(POST)) {
				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String poll_id = requestParameters.get("id").toString();
				String duration = requestParameters.get("duration").toString();
				responseData = updatePoll(poll_id, duration);
			} else if (url.equals("/savePoll") && method.equals(POST)) {
				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				JSONObject pollInsertData = (JSONObject) (requestParameters.get("insertPollData"));
				JSONArray insertPollOptionsData = (JSONArray) requestParameters.get("insertPollOptionsData");

				responseData = savePoll(pollInsertData, insertPollOptionsData);
			} else if (url.equals("/getPoll") && method.equals(POST)) {
				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String poll_id = requestParameters.get("id").toString();
				responseData = getPoll(poll_id);
			} else if (url.equals("/saveVote") && method.equals(POST)) {
				ServletInputStream requestBody = request.getInputStream();
				JSONParser jsonParser = new JSONParser();
				JSONObject requestParameters = (JSONObject) jsonParser
						.parse(new InputStreamReader(requestBody, "UTF-8"));
				String poll_id = requestParameters.get("poll_id").toString();
				Long poll_option_id = Long.parseLong(requestParameters.get("poll_option_id").toString());
				String user_id = requestParameters.getOrDefault("user_id", "").toString();
				saveVote(Long.parseLong(poll_id), poll_option_id);

				if (user_id.isEmpty()) {
					responseData = new JSONObject();
					responseData.put("status", true);
				} else {
					responseData = getPollDetails(poll_id, user_id);
				}
			} else if (url.equals("/FOLDER_ID") && method.equals(GET)) {
				responseData = new JSONObject();
				responseData.put("FOLDER_ID", getFolderId());
			}
			response.setStatus(200);
		} catch (UserAlreadyExists e) {
			LOGGER.log(Level.SEVERE, "Exception in Service", e);
			response.setStatus(400);
			responseData = new JSONObject();
			responseData.put("status", false);
			responseData.put("message", e.getMessage());
		} catch (Exception e) {
			LOGGER.log(Level.SEVERE, "Exception in Service", e);
			response.setStatus(500);
			responseData = new JSONObject();
			responseData.put("status", false);
			responseData.put("message", e);
		}
		if (fileStream == null) {
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(responseData.toJSONString());
		} else {
			response.getOutputStream().write(fileStream);
		}
	}

	private static JSONObject getAllPolls(String user_id, Integer page) throws Exception {

		HashMap<String, ResponseData> pollDatas = new HashMap<>();
		HashMap<String, Object> result = new HashMap<>();

		ArrayList<String> pollIDs = new ArrayList<>();
		String query = "", pollID = "";
		ArrayList<ZCRowObject> rowList = null;
		ZCRowObject zcRowObject = null;
		Integer totalPage = 0, pollCount = 0;
		HashMap<String, Object> votedData = null;

		query = "select count(Polls.ROWID) from Polls;";
		rowList = ZCQL.getInstance().executeQuery(query);
		zcRowObject = rowList.get(0);
		pollCount = Integer.parseInt(zcRowObject.get("ROWID").toString());
		totalPage = (int) Math.ceil((float) pollCount / 6);

		if (totalPage < page) {
			page = totalPage;
		}
		Integer range = ((page - 1) * 6) + 1;
		range = range > 0 ? range : 1;
		query = String.format(
				"select Polls.content,Polls.duration,Polls.category,Polls.ROWID,Polls.votes from Polls limit %d,6",
				range);
		rowList = ZCQL.getInstance().executeQuery(query);

		for (ZCRowObject rowData : rowList) {
			votedData = new HashMap<String, Object>();
			votedData.put("voted", false);
			votedData.put("userVotedPoll", "NIL");
			votedData.put("userVotedTime", "NIL");
			votedData.put("userVotedPollVotes", "0");

			ResponseData pollData = new ResponseData(rowData, votedData, false);

			pollIDs.add(rowData.get("ROWID").toString());
			pollDatas.put(rowData.get("ROWID").toString(), pollData);

		}

		if (pollIDs.size() > 0) {
			query = String.format(
					"select PollOptions.content,PollOptions.votes,User_Polls.poll_id,User_Polls.voted_time from PollOptions inner join User_Polls on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = '%s' and User_Polls.poll_id in (%s)",
					user_id, String.join(",", pollIDs));

			rowList = ZCQL.getInstance().executeQuery(query);

			for (ZCRowObject rowData : rowList) {
				pollID = rowData.get("User_Polls", "poll_id").toString();
				votedData = new HashMap<String, Object>();
				votedData.put("voted", true);
				votedData.put("userVotedPoll", rowData.get("PollOptions", "content"));
				votedData.put("userVotedTime", rowData.get("User_Polls", "voted_time"));
				votedData.put("userVotedPollVotes", rowData.get("PollOptions", "votes"));
				pollDatas.get(pollID).setVotedData(votedData);
			}
		}

		result.put("status", true);
		result.put("currentPage", page);
		result.put("totalPage", totalPage);
		result.put("data", pollDatas.values());

		return new JSONObject(result);

	}

	private static JSONObject getMyVotesOrCompletedPolls(String user_id, Integer page) throws Exception {

		HashMap<String, ResponseData> pollDatas = new HashMap<>();
		HashMap<String, Object> result = new HashMap<>();

		String query = "";
		Integer userPollCount = 0;
		ArrayList<ZCRowObject> rowList = null;
		ZCRowObject zcRowObject = null;
		Integer totalPage = 0, range;
		HashMap<String, Object> votedData = null;

		query = String.format("select count(User_Polls.ROWID) from User_Polls where User_Polls.CREATORID  = '%s'",
				user_id);
		rowList = ZCQL.getInstance().executeQuery(query);
		zcRowObject = rowList.get(0);
		userPollCount = Integer.parseInt(zcRowObject.get("ROWID").toString());
		totalPage = (int) Math.ceil((float) userPollCount / 6);

		if (totalPage < page) {
			page = totalPage;
		}

		range = ((page - 1) * 6) + 1;
		range = range > 0 ? range : 1;

		query = String.format(
				"select Polls.content,Polls.category,Polls.duration,Polls.ROWID,Polls.votes,PollOptions.content,PollOptions.votes,User_Polls.voted_time from Polls inner join User_Polls on Polls.ROWID = User_Polls.poll_id inner join PollOptions on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = '%s' limit %d,6;",
				user_id, range);
		rowList = ZCQL.getInstance().executeQuery(query);

		for (ZCRowObject rowData : rowList) {
			votedData = new HashMap<String, Object>();
			votedData.put("voted", true);
			votedData.put("userVotedPoll", rowData.get("PollOptions", "content"));
			votedData.put("userVotedTime", rowData.get("User_Polls", "voted_time"));
			votedData.put("userVotedPollVotes", rowData.get("PollOptions", "votes"));

			ResponseData pollData = new ResponseData(rowData, votedData, false);
			pollDatas.put(rowData.get("ROWID").toString(), pollData);

		}

		result.put("status", true);
		result.put("currentPage", page);
		result.put("totalPage", totalPage);
		result.put("data", pollDatas.values());

		return new JSONObject(result);

	}

	private static JSONObject getMyPolls(String user_id, Integer page) throws Exception {

		HashMap<String, ResponseData> pollDatas = new HashMap<>();
		HashMap<String, Object> result = new HashMap<>();

		ArrayList<String> pollIDs = new ArrayList<>();
		String query = "", pollID = "";
		ArrayList<ZCRowObject> rowList = null;
		ZCRowObject zcRowObject = null;
		Integer totalPage = 0, pollCount = 0;
		HashMap<String, Object> votedData = null;

		query = String.format("select count(Polls.ROWID) from Polls where Polls.CREATORID='%s'", user_id);
		rowList = ZCQL.getInstance().executeQuery(query);
		zcRowObject = rowList.get(0);
		pollCount = Integer.parseInt(zcRowObject.get("ROWID").toString());
		totalPage = (int) Math.ceil((float) pollCount / 6);

		if (totalPage < page) {
			page = totalPage;
		}
		Integer range = ((page - 1) * 6) + 1;
		range = range > 0 ? range : 1;
		query = String.format(
				"select Polls.content,Polls.duration,Polls.category,Polls.ROWID,Polls.votes from Polls where Polls.CREATORID = '%s' limit %d,6",
				user_id, range);
		rowList = ZCQL.getInstance().executeQuery(query);

		for (ZCRowObject rowData : rowList) {
			votedData = new HashMap<String, Object>();
			votedData.put("voted", false);
			votedData.put("userVotedPoll", "NIL");
			votedData.put("userVotedTime", "NIL");
			votedData.put("userVotedPollVotes", "0");

			ResponseData pollData = new ResponseData(rowData, votedData, true);

			pollIDs.add(rowData.get("ROWID").toString());
			pollDatas.put(rowData.get("ROWID").toString(), pollData);

		}

		if (pollIDs.size() > 0) {
			query = String.format(
					"select PollOptions.content,PollOptions.votes,User_Polls.poll_id,User_Polls.voted_time from PollOptions inner join User_Polls on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = '%s' and User_Polls.poll_id in (%s)",
					user_id, String.join(",", pollIDs));

			rowList = ZCQL.getInstance().executeQuery(query);

			for (ZCRowObject rowData : rowList) {
				pollID = rowData.get("User_Polls", "poll_id").toString();
				votedData = new HashMap<String, Object>();
				votedData.put("voted", true);
				votedData.put("userVotedPoll", rowData.get("PollOptions", "content"));
				votedData.put("userVotedTime", rowData.get("User_Polls", "voted_time"));
				votedData.put("userVotedPollVotes", rowData.get("PollOptions", "votes"));
				pollDatas.get(pollID).setVotedData(votedData);
			}
		}

		result.put("status", true);
		result.put("currentPage", page);
		result.put("totalPage", totalPage);
		result.put("data", pollDatas.values());

		return new JSONObject(result);

	}

	private static JSONObject getMyPollsEnded(String user_id, Integer page) throws Exception {

		HashMap<String, ResponseData> pollDatas = new HashMap<>();
		HashMap<String, Object> result = new HashMap<>();

		ArrayList<String> pollIDs = new ArrayList<>();
		String query = "", pollID = "", currentTime;
		ArrayList<ZCRowObject> rowList = null;
		ZCRowObject zcRowObject = null;
		Integer totalPage = 0, pollCount = 0;
		HashMap<String, Object> votedData = null;

		currentTime = getCurrentISTTime();
		query = String.format(
				"select count(Polls.ROWID) from Polls where Polls.CREATORID='%s' and Polls.duration <= '%s'", user_id,
				currentTime);
		rowList = ZCQL.getInstance().executeQuery(query);
		zcRowObject = rowList.get(0);
		pollCount = Integer.parseInt(zcRowObject.get("ROWID").toString());
		totalPage = (int) Math.ceil((float) pollCount / 6);

		if (totalPage < page) {
			page = totalPage;
		}
		Integer range = ((page - 1) * 6) + 1;
		range = range > 0 ? range : 1;
		query = String.format(
				"select Polls.content,Polls.duration,Polls.category,Polls.ROWID,Polls.votes from Polls where Polls.CREATORID = '%s' and Polls.duration <= '%s' limit %d,6",
				user_id, currentTime, range);
		rowList = ZCQL.getInstance().executeQuery(query);

		for (ZCRowObject rowData : rowList) {
			votedData = new HashMap<String, Object>();
			votedData.put("voted", false);
			votedData.put("userVotedPoll", "NIL");
			votedData.put("userVotedTime", "NIL");
			votedData.put("userVotedPollVotes", "0");

			ResponseData pollData = new ResponseData(rowData, votedData, true);

			pollIDs.add(rowData.get("ROWID").toString());
			pollDatas.put(rowData.get("ROWID").toString(), pollData);

		}

		if (pollIDs.size() > 0) {
			query = String.format(
					"select PollOptions.content,PollOptions.votes,User_Polls.poll_id,User_Polls.voted_time from PollOptions inner join User_Polls on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = '%s' and User_Polls.poll_id in (%s)",
					user_id, String.join(",", pollIDs));

			rowList = ZCQL.getInstance().executeQuery(query);

			for (ZCRowObject rowData : rowList) {
				pollID = rowData.get("User_Polls", "poll_id").toString();
				votedData = new HashMap<String, Object>();
				votedData.put("voted", true);
				votedData.put("userVotedPoll", rowData.get("PollOptions", "content"));
				votedData.put("userVotedTime", rowData.get("User_Polls", "voted_time"));
				votedData.put("userVotedPollVotes", rowData.get("PollOptions", "votes"));
				pollDatas.get(pollID).setVotedData(votedData);
			}
		}

		result.put("status", true);
		result.put("currentPage", page);
		result.put("totalPage", totalPage);
		result.put("data", pollDatas.values());

		return new JSONObject(result);

	}

	private static JSONObject deletePoll(String poll_id) throws Exception {
		HashMap<String, Object> result = new HashMap<String, Object>();
		ArrayList<Long> fileIDS = new ArrayList<>();
		ArrayList<ZCRowObject> rowList = null;
		String query = "";
		ZCObject obj = ZCObject.getInstance();
		ZCFile fileStore = ZCFile.getInstance();
		ZCFolder folder = fileStore.getFolderInstance(Long.parseLong(getFolderId()));

		ZCTable table = obj.getTable("Polls");
		ZCRowObject row = table.getRow(Long.parseLong(poll_id));

		if (!row.get("file_id").toString().isEmpty()) {
			fileIDS.add(Long.parseLong(row.get("file_id").toString()));
		}

		query = String.format("SELECT PollOptions.file_id from PollOptions where PollOptions.poll_id = '%s'", poll_id);

		rowList = ZCQL.getInstance().executeQuery(query);

		for (ZCRowObject rowData : rowList) {
			if (!rowData.get("file_id").toString().isEmpty()) {
				fileIDS.add(Long.parseLong(rowData.get("file_id").toString()));
			}
		}

		if (fileIDS.size() > 0) {
			for (Long fileId : fileIDS) {
				folder.deleteFile(fileId);
			}
		}
		table.deleteRow(Long.parseLong(poll_id));
		result.put("status", true);
		return new JSONObject(result);
	}

	private static JSONObject getAllPollsGuest(Integer page) throws Exception {

		HashMap<String, ResponseData> pollDatas = new HashMap<>();
		HashMap<String, Object> result = new HashMap<>();
		String query = "";
		ArrayList<ZCRowObject> rowList = null;
		ZCRowObject zcRowObject = null;
		Integer totalPage = 0, pollCount = 0;
		HashMap<String, Object> votedData = null;

		query = "select count(Polls.ROWID) from Polls;";
		rowList = ZCQL.getInstance().executeQuery(query);
		zcRowObject = rowList.get(0);
		pollCount = Integer.parseInt(zcRowObject.get("ROWID").toString());
		totalPage = (int) Math.ceil((float) pollCount / 6);

		if (totalPage < page) {
			page = totalPage;
		}
		Integer range = ((page - 1) * 6) + 1;
		range = range > 0 ? range : 1;
		query = String.format(
				"select Polls.content,Polls.duration,Polls.category,Polls.ROWID,Polls.votes from Polls limit %d,6",
				range);
		rowList = ZCQL.getInstance().executeQuery(query);

		for (ZCRowObject rowData : rowList) {
			votedData = new HashMap<String, Object>();
			votedData.put("voted", false);
			votedData.put("userVotedPoll", "NIL");
			votedData.put("userVotedTime", "NIL");
			votedData.put("userVotedPollVotes", "0");

			ResponseData pollData = new ResponseData(rowData, votedData, false);

			pollDatas.put(rowData.get("ROWID").toString(), pollData);

		}

		result.put("status", true);
		result.put("currentPage", page);
		result.put("totalPage", totalPage);
		result.put("data", pollDatas.values());

		return new JSONObject(result);

	}

	private static JSONObject registerUser(String email_id, String first_name, String last_name, Long ZAID)
			throws Exception {

		HashMap<String, Object> result = new HashMap<>();
		List<ZCUserDetail> details = ZCUser.getInstance().getAllUser();
		for (ZCUserDetail zcUserDetail : details) {
			if (zcUserDetail.getEmailId().toString().equals(email_id)) {
				throw new UserAlreadyExists("User Already Exits");
			}
		}
		ZCSignUpData signUpdetails = ZCSignUpData.getInstance();
		signUpdetails.setPlatformType(PlatformType.WEB);
		signUpdetails.userDetail.setFirstName(first_name);
		signUpdetails.userDetail.setZaaid(ZAID);
		signUpdetails.userDetail.setEmailId(email_id);
		signUpdetails.userDetail.setLastName(last_name);
		signUpdetails = ZCUser.getInstance().registerUser(signUpdetails);
		result.put("status", true);
		return new JSONObject(result);
	}

	private byte[] downloadImage(Long file_id) throws Exception {
		ZCFile fileStore = ZCFile.getInstance();
		ZCFolder folder = fileStore.getFolderInstance(Long.parseLong(getFolderId()));
		InputStream fileStream = folder.downloadFile(file_id);
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		byte[] buffer = new byte[1024];
		int len;
		while ((len = fileStream.read(buffer)) != -1) {
			os.write(buffer, 0, len);
		}
		return os.toByteArray();

	}

	private static String getCurrentISTTime() {
		String ISTTime = "";
		Date currentTime = new Date();
		DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		dateFormat.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));
		ISTTime = dateFormat.format(currentTime);
		return ISTTime;
	}

	private static JSONObject getPollDetails(String poll_id) throws Exception {
		String query = "";
		ArrayList<ZCRowObject> rowList = null;
		HashMap<String, Object> result = new HashMap<String, Object>();
		HashMap<String, Object> pollData = new HashMap<String, Object>();
		ArrayList<HashMap<String, Object>> optionsList = new ArrayList<HashMap<String, Object>>();
		HashMap<String, Object> options = null;

		query = String.format(
				"select Polls.content,Polls.file_id,Polls.votes,Polls.category,PollOptions.content,PollOptions.file_id,PollOptions.votes,PollOptions.ROWID from Polls inner join PollOptions on PollOptions.poll_id =  Polls.ROWID where Polls.ROWID = '%s' ORDER BY PollOptions.votes DESC",
				poll_id);
		rowList = ZCQL.getInstance().executeQuery(query);

		if (rowList.isEmpty()) {
			throw new NoDataFoundException("No data found");
		}

		for (ZCRowObject rowData : rowList) {
			options = new HashMap<String, Object>();
			options.put("content", rowData.get("PollOptions", "content"));
			options.put("file_id", rowData.get("PollOptions", "file_id"));
			options.put("votes", rowData.get("PollOptions", "votes"));
			optionsList.add(options);

			pollData.put("content", rowData.get("Polls", "content"));
			pollData.put("file_id", rowData.get("Polls", "file_id"));
			pollData.put("votes", rowData.get("Polls", "votes"));
			pollData.put("category", rowData.get("Polls", "category"));

		}
		pollData.put("options", optionsList);
		result.put("status", true);
		result.put("data", pollData);

		return new JSONObject(result);
	}

	private static JSONObject getPollDetails(String poll_id, String user_id) throws Exception {
		String query = "";
		ArrayList<ZCRowObject> rowList = null;
		HashMap<String, Object> result = new HashMap<String, Object>();
		HashMap<String, Object> pollData = new HashMap<String, Object>();
		ArrayList<HashMap<String, Object>> optionsList = new ArrayList<HashMap<String, Object>>();
		HashMap<String, Object> options = null;
		ZCRowObject zcRowObject = null;

		query = String.format(
				"select Polls.content,Polls.file_id,Polls.votes,Polls.category,PollOptions.content,PollOptions.file_id,PollOptions.votes,PollOptions.ROWID from Polls inner join PollOptions on PollOptions.poll_id =  Polls.ROWID where Polls.ROWID = '%s' ORDER BY PollOptions.votes DESC",
				poll_id);
		rowList = ZCQL.getInstance().executeQuery(query);

		if (rowList.isEmpty()) {

			throw new NoDataFoundException("No data found");
		}

		for (ZCRowObject rowData : rowList) {
			options = new HashMap<String, Object>();
			options.put("content", rowData.get("PollOptions", "content"));
			options.put("file_id", rowData.get("PollOptions", "file_id"));
			options.put("votes", rowData.get("PollOptions", "votes"));
			optionsList.add(options);

			pollData.put("content", rowData.get("Polls", "content"));
			pollData.put("file_id", rowData.get("Polls", "file_id"));
			pollData.put("votes", rowData.get("Polls", "votes"));
			pollData.put("category", rowData.get("Polls", "category"));

		}
		pollData.put("options", optionsList);

		query = String.format(
				"select PollOptions.content from PollOptions inner join User_Polls on User_Polls.poll_option_id = PollOptions.ROWID where User_Polls.CREATORID = '%s' and User_Polls.poll_id = '%s'",
				user_id, poll_id);
		rowList = ZCQL.getInstance().executeQuery(query);

		if (rowList.size() > 0) {
			zcRowObject = rowList.get(0);
			pollData.put("userVotedPoll", zcRowObject.get("PollOptions", "content"));
		} else {
			pollData.put("userVotedPoll", "NIL");
		}
		result.put("status", true);
		result.put("data", pollData);
		return new JSONObject(result);

	}

	private static JSONObject updatePoll(String poll_id, String duration) throws Exception {
		HashMap<String, Object> result = new HashMap<String, Object>();
		ZCObject object = ZCObject.getInstance();
		ZCTable table = object.getTable("Polls");
		ArrayList<ZCRowObject> rows = new ArrayList<ZCRowObject>();
		ZCRowObject updateRow = ZCRowObject.getInstance();
		table.getRow(Long.parseLong(poll_id));
		updateRow.set("ROWID", poll_id);
		updateRow.set("duration", duration);
		rows.add(updateRow);
		table.updateRows(rows);
		result.put("status", true);
		return new JSONObject(result);

	}

	private static JSONObject savePoll(JSONObject pollInsertData, JSONArray pollOptionsInsertArray) throws Exception {
		HashMap<String, Object> result = new HashMap<String, Object>();
		ZCObject object = ZCObject.getInstance();
		ZCTable pollTable = object.getTable("Polls");
		ZCTable pollOptionsTable = object.getTable("PollOptions");
		ZCRowObject insertPollObject = ZCRowObject.getInstance();

		ArrayList<ZCRowObject> pollOptionsList = new ArrayList<ZCRowObject>();
		HashMap<String, Object> pollData = new HashMap<String, Object>();
		HashMap<String, Object> options = null;
		ArrayList<HashMap<String, Object>> optionsList = new ArrayList<HashMap<String, Object>>();
		Integer i;

		insertPollObject.setRowObject(pollInsertData);
		ZCRowObject zcRowObject = pollTable.insertRow(insertPollObject);

		for (i = 0; i < pollOptionsInsertArray.size(); i++) {
			ZCRowObject insertPollOptionsObject = ZCRowObject.getInstance();
			insertPollOptionsObject.setRowObject((JSONObject) pollOptionsInsertArray.get(i));
			insertPollOptionsObject.set("poll_id", zcRowObject.get("ROWID").toString());
			pollOptionsList.add(insertPollOptionsObject);
		}
		pollOptionsList = (ArrayList<ZCRowObject>) pollOptionsTable.insertRows(pollOptionsList);

		pollData.put("id", zcRowObject.get("ROWID"));
		pollData.put("content", zcRowObject.get("content"));
		pollData.put("duration", zcRowObject.get("duration"));
		pollData.put("file_id", zcRowObject.get("file_id"));
		pollData.put("category", zcRowObject.get("category"));
		pollData.put("created_by", zcRowObject.get("created_by"));

		for (ZCRowObject rowData : pollOptionsList) {
			options = new HashMap<String, Object>();
			options.put("id", rowData.get("ROWID"));
			options.put("content", rowData.get("content"));
			options.put("file_id", rowData.get("file_id"));
			optionsList.add(options);
		}

		pollData.put("options", optionsList);

		result.put("status", true);
		result.put("data", pollData);

		return new JSONObject(result);

	}

	private static JSONObject getPoll(String poll_id) throws Exception {
		String query = "";
		ArrayList<ZCRowObject> rowList = null;
		HashMap<String, Object> result = new HashMap<String, Object>();
		HashMap<String, Object> pollData = new HashMap<String, Object>();
		ArrayList<HashMap<String, Object>> optionsList = new ArrayList<HashMap<String, Object>>();
		HashMap<String, Object> options = null;

		query = String.format(
				"select Polls.ROWID,Polls.content,Polls.duration,Polls.category,Polls.created_by,Polls.file_id,PollOptions.content,PollOptions.file_id,PollOptions.ROWID from Polls inner join PollOptions on Polls.ROWID = PollOptions.poll_id where Polls.ROWID = '%s'",
				poll_id);
		rowList = ZCQL.getInstance().executeQuery(query);

		if (rowList.isEmpty()) {
			throw new NoDataFoundException("No data found");
		}

		for (ZCRowObject rowData : rowList) {
			options = new HashMap<String, Object>();
			options.put("content", rowData.get("PollOptions", "content"));
			options.put("file_id", rowData.get("PollOptions", "file_id"));
			options.put("id", rowData.get("PollOptions", "ROWID"));
			optionsList.add(options);

			pollData.put("id", rowData.get("Polls", "ROWID"));
			pollData.put("content", rowData.get("Polls", "content"));
			pollData.put("duration", rowData.get("Polls", "duration"));
			pollData.put("category", rowData.get("Polls", "category"));
			pollData.put("created_by", rowData.get("Polls", "created_by"));
			pollData.put("file_id", rowData.get("Polls", "file_id"));

		}
		pollData.put("options", optionsList);
		result.put("status", true);
		result.put("data", pollData);

		return new JSONObject(result);
	}

	private static void saveVote(Long poll_id, Long poll_option_id) throws Exception {
		ZCRowObject pollData = ZCRowObject.getInstance();
		ZCRowObject pollOptionData = ZCRowObject.getInstance();
		ZCRowObject updateData = ZCRowObject.getInstance();
		ZCRowObject insertData = ZCRowObject.getInstance();
		ZCObject obj = ZCObject.getInstance();
		ArrayList<ZCRowObject> rows = new ArrayList<ZCRowObject>();

		ZCTable pollTable = obj.getTable("Polls");
		ZCTable pollOptionTable = obj.getTable("PollOptions");
		ZCTable userPollTable = obj.getTable("User_Polls");
		Integer tempVotes;

		pollData = pollTable.getRow(poll_id);
		pollOptionData = pollOptionTable.getRow(poll_option_id);

		tempVotes = Integer.parseInt(pollData.get("votes").toString()) + 1;
		updateData.set("votes", tempVotes);
		updateData.set("ROWID", pollData.get("ROWID").toString());
		rows.add(updateData);
		pollTable.updateRows(rows);
		rows.clear();

		updateData = ZCRowObject.getInstance();
		tempVotes = Integer.parseInt(pollOptionData.get("votes").toString()) + 1;
		updateData.set("votes", tempVotes);
		updateData.set("ROWID", pollOptionData.get("ROWID").toString());
		rows.add(updateData);
		pollOptionTable.updateRows(rows);
		rows.clear();

		insertData.set("poll_id", poll_id.toString());
		insertData.set("poll_option_id", poll_option_id.toString());
		insertData.set("voted_time", getCurrentISTTime());

		userPollTable.insertRow(insertData);
	}

	private static String getFolderId() throws Exception {
		ZCFile fileStore = ZCFile.getInstance();
		List<ZCFolder> folderDetails = fileStore.getFolder();
		String FOLDER_ID = "";
		for (ZCFolder folder : folderDetails) {
			if (folder.getFolderName().equals("Images")) {
				FOLDER_ID = folder.getFolderId().toString();
				break;
			}
		}

		return FOLDER_ID;
	}

}