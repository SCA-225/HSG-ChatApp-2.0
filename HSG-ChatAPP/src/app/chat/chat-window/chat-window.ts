import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.html',
  styleUrls: ['./chat-window.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ChatWindow {
  @Input() nickname!: string;
  @ViewChild('messageSpace') messageSpace!: ElementRef<HTMLDivElement>;


  
  messages: { text: string; nickname: string; date: string }[] = [];
  messageText: string = '';      // Text aus Input-Feld
  timestamp: string = '';

  

sendMessage() {


  if (!this.nickname) {
    alert("Please add a nickname!");
    return;
  }


  const text = this.messageText.trim();
  if (!text) {
    alert("Please add a Message!");
    
    return;
  }

  this.timestamp = new Date().toLocaleString('de');

  this.messages.push({
    text,
    nickname: this.nickname,
    date: this.timestamp
  });


  this.messageText = '';
  this.scrollToBottom();
  setTimeout(() => this.scrollToBottom(), 0);
}

  scrollToBottom() {
    const container = document.querySelector('.message-space');
    if(container) {
      container.scrollTop = container.scrollHeight;
    }
  }


}
