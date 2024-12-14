import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { webSocketCorsOptions } from "./configs/cors";
import { blockUserEvent, unblockUserEvent } from "./web-socket-events/block-events";
import { disconnectEvent } from "./web-socket-events/connection-events";
import {
  addMembersToGroupDiscussionEvent,
  createGroupDiscussionEvent,
  deleteDiscussionEvent,
  deleteMessageForEverybodyEvent,
  deleteMessageForMeEvent,
  editGroupDiscussionEvent,
  exitGroupDiscussionEvent,
  removeMemberFromGroupDiscussionEvent,
  seeDiscussionMessagesEvent,
  sendMessageEvent,
} from "./web-socket-events/discussion-events";
import { followEvent, unfollowEvent } from "./web-socket-events/follow-events";
import {
  defineIfOtherUserCanSeeMyOnlineStatusEvent,
  updateOnlineStatusEvent,
} from "./web-socket-events/online-status-events";
import { commentPostEvent, deletePostCommentEvent } from "./web-socket-events/post-comment-events";
import { likePostCommentEvent, unlikePostCommentEvent } from "./web-socket-events/post-comment-like-events";
import { publishPostEvent } from "./web-socket-events/post-events";
import { likePostEvent, unlikePostEvent } from "./web-socket-events/post-like-events";
import { requireWebsocketAuth, webSocketSessionAuth } from "./web-socket-middlewares/web-socket-auth-middlewares";

export const setupWebSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: webSocketCorsOptions,
    maxHttpBufferSize: 1e8,
  });
  io.use(webSocketSessionAuth);

  io.on("connection", (socket) => {
    // socket.request
    //
    socket.use((e, next) => requireWebsocketAuth(io, socket, next));

    socket.on("update-online-status", () => updateOnlineStatusEvent(io, socket));
    socket.on("define-if-other-user-can-see-my-online-status", () =>
      defineIfOtherUserCanSeeMyOnlineStatusEvent(socket)
    );

    //
    socket.on("publish-post", (data) => publishPostEvent(socket, data));

    //
    socket.on("send-message", (data) => sendMessageEvent(socket, data));
    socket.on("delete-message-for-everybody", (data) => deleteMessageForEverybodyEvent(socket, data));
    socket.on("delete-message-for-me", (data) => deleteMessageForMeEvent(socket, data));
    socket.on("create-group-discussion", (data) => createGroupDiscussionEvent(socket, data));
    socket.on("add-members-to-group-discussion", (data) => addMembersToGroupDiscussionEvent(socket, data));
    socket.on("remove-member-from-group-discussion", (data) => removeMemberFromGroupDiscussionEvent(socket, data));
    socket.on("edit-group-discussion", (data) => editGroupDiscussionEvent(socket, data));
    socket.on("see-discussion-messages", (data) => seeDiscussionMessagesEvent(socket, data));
    socket.on("delete-discussion", (data) => deleteDiscussionEvent(socket, data));
    socket.on("exit-group-discussion", (data) => exitGroupDiscussionEvent(socket, data));

    //
    socket.on("block-user", (data) => blockUserEvent(socket, data));
    socket.on("unblock-user", (data) => unblockUserEvent(socket, data));

    //
    socket.on("follow", (data) => followEvent(socket, data));
    socket.on("unfollow", (data) => unfollowEvent(socket, data));

    //
    socket.on("like-post", (data) => likePostEvent(socket, data));
    socket.on("unlike-post", (data) => unlikePostEvent(socket, data));

    //
    socket.on("comment-post", (data) => commentPostEvent(socket, data));
    socket.on("delete-post-comment", (data) => deletePostCommentEvent(socket, data));

    //
    socket.on("like-post-comment", (data) => likePostCommentEvent(socket, data));
    socket.on("unlike-post-comment", (data) => unlikePostCommentEvent(socket, data));

    //

    socket.on("disconnect", () => disconnectEvent(io, socket));
    socket.on("connect_failed", function () {
    });
  });
};
