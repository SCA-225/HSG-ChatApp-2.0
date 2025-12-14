import { Component } from '@angular/core';
import { ChatWindow } from '../../chat/chat-window/chat-window';
import { Nickname } from "../../chat/nickname/nickname";

@Component({
  selector: 'app-body',
  standalone: true,
  templateUrl: './body.html',
  styleUrls: ['./body.css'],
  imports: [ChatWindow, Nickname]
})
export class BodyComponent {

nickname: string = '';
avatar: string = '';

setNickname(data: { nickname: string; avatar: string }) {
  this.nickname = data.nickname;
  this.avatar = data.avatar;
}
}
