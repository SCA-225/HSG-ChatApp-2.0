import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

const API_BASE_URL = 'http://localhost:3000';

@Component({
  selector: 'app-nickname',
  templateUrl: './nickname.html',
  styleUrl: './nickname.css',
  standalone: true,
  imports: [FormsModule],
})
export class Nickname {
  nicknameCreate = output<{ nickname: string; avatar: string }>();

  nickname: string = '';
  errorMessage: string = '';

  selectedAvatar: string = 'avatar1.png'; // Default

  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }

  // --------------------------------------------------
  // Nickname anlegen → POST /nicknames (mit Avatar)
  // --------------------------------------------------
  async createNickname(nickname: string, avatar: string): Promise<void> {
    nickname = nickname.replace(/(\r\n|\r|\n)/, '').trim();

    if (!nickname) {
      alert('Please add a nickname!');
      this.nickname = '';
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/nicknames`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, avatar }), // << WICHTIG: avatar mitsenden
      });

      if (response.status === 409) {
        const msg = await response.text();
        this.errorMessage = msg;
        alert(msg);
        return;
      }

      if (!response.ok) {
        const msg = await response.text();
        this.errorMessage = msg || 'Unbekannter Fehler beim Anlegen des Nicknames.';
        alert(this.errorMessage);
        return;
      }

      const saved = await response.json();

      this.errorMessage = '';
      this.nicknameCreate.emit({
        nickname: saved.nickname ?? nickname,
        avatar: saved.avatar ?? this.selectedAvatar,
      });

      this.nickname = '';
    } catch (err) {
      console.error('Server nicht erreichbar (POST /nicknames)', err);
      this.errorMessage = 'Server nicht erreichbar. Läuft der Chat-API-Server auf Port 3000?';
      alert(this.errorMessage);
    }
  }
}
