import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nickname',
  templateUrl: './nickname.html',
  styleUrl: './nickname.css',
  imports: [FormsModule]
})
export class Nickname {
  nicknameCreate = output<string>();

  nickname = "";
  errorMessage!: string;

  createNickname(nickname:string): void{
    nickname = nickname.replace(/(\r\n|\r|\n)/, '');
    nickname = nickname.trim();

    if (!nickname) {
      alert("Please add a nickname!");
      this.nickname = "";

      return;
    }

    this.nicknameCreate.emit(nickname);
    this.nickname = '';

  }

}
