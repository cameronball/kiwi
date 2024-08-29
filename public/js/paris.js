var parisHistory = null;

$(document).ready(() => {
	parisHistory = JSON.parse(localStorage.getItem("parisHistory"));
	if (parisHistory == null) {
		localStorage.setItem("parisHistory", JSON.stringify(
			[{
				role: "user",
				parts: [{ text: "Hello" }],
			},
			 {
				 role: "model",
				 parts: [{ text: `Hi ${userLoggedIn.firstName}! I am Paris, your personal assistant here on Kiwe. What would you like to know or talk about today?` }],
			 },
			]
		));
		parisHistory = JSON.parse(localStorage.getItem("parisHistory"));
	}

	parisHistory.slice(1).forEach(item => {
		  let model = null;
		  if (item.role == "model") {
		      model=true;
		  }
		  else {
		      model=false;
		  }
		  addChatMessageHtml(item.parts[0].text, model);
	});
});

$(".sendMessageButton").click(() => {
	messageSubmitted();
});

$(".startNewChatButton").click(() => {
	localStorage.removeItem("parisHistory");
	location.reload();
});

$(".inputTextbox").keydown((event) => {

	if(event.which === 13 && !event.shiftKey) {
		messageSubmitted();
		return false
	}
});

function messageSubmitted() {
	var content = $(".inputTextbox").val().trim();

	if(content != "") {
		sendMessage(content);
		$(".inputTextbox").val("");
	}
}

function sendMessage(content) {
	addChatMessageHtml(content, false);
	$(".chatMessages").append(`<li class="message theirs first last" id="typingIndicator">
		<div style="height:50px;width:50px;" class="imageContainer">
							<img src="/images/paris.png">
						</div>
		<div class="messageContainer">
			<span class="senderName">Paris</span>
<div class="typingDots" style="height:50px;padding-left:0px;"> <img src="/images/dots.gif" alt="Typing..."></div>
			
		</div>
	</li>`);
	$.get("/api/messages/paris", { message: content, parisHistory: parisHistory }, (data, status, xhr) => {
		parisHistory.push({role: 'user', parts: [{ text: content }] });
		localStorage.setItem("parisHistory", JSON.stringify(parisHistory));
		addChatMessageHtml(data.response.candidates[0].content.parts[0].text.replace(/\*/g, "").replace(/\n+$/, ''), true);
		$('#typingIndicator').remove();
		parisHistory.push({role: 'model', parts: [{ text: data.response.candidates[0].content.parts[0].text.replace(/\*/g, "").replace(/\n+$/, '') }] });
		localStorage.setItem("parisHistory", JSON.stringify(parisHistory));
	});
}

function addChatMessageHtml(message, model) {
	var messageDiv = createMessageHtml(message, model);
	addMessagesHtmlToPage(messageDiv);
}

function addMessagesHtmlToPage(html) {
	$(".chatMessages").append(html);
}

function createMessageHtml(message, model) {

	if (model === true) {
		senderName = "Paris"
	}
	else {
		senderName = "You"
	}

	message = message.replace(/\n/g, "<br>");

	var liClassName = model ? "theirs" : "mine";

	liClassName += " first";

	if(model) {
		nameElement = `<span class='senderName'>${senderName}</span>`;
	}
	else {
		nameElement = "";
	}

	var profileImage = "";
	liClassName += " last";
	if (model) {
		profileImage = "/images/paris.png";
	}
	else {
		profileImage = userLoggedIn.profilePic;
	}
	profileImage = `<img src='${profileImage}'>`;

	var imageContainer = "";
	if(model) {
		imageContainer = `<div style="height:50px;width:50px;" class='imageContainer'>
							${profileImage}
						</div>`;
	}
	
	var messageContent = message;

	return `<li class='message ${liClassName}'>
		${imageContainer}
		<div class='messageContainer'>
			${nameElement}
			<span class='messageBody'>
				${messageContent}
			</span>
		</div>
	</li>`
}
