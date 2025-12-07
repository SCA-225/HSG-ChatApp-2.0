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
  nicknameCreate = output<string>();

  nickname: string = '';
  errorMessage: string = '';

  // --------------------------------------------------
  // Nickname anlegen → POST /nicknames
  // --------------------------------------------------
  async createNickname(nickname: string): Promise<void> {
    // 1) Local Cleaning
    nickname = nickname.replace(/(\r\n|\r|\n)/, '');
    nickname = nickname.trim();

    if (!nickname) {
      alert('Please add a nickname!');
      this.nickname = '';
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/nicknames`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      if (response.status === 409) {
        // Nickname schon vergeben
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
      // an Body weitergeben → dort an ChatWindow gebunden
      this.nicknameCreate.emit(saved.nickname ?? nickname);
      this.nickname = '';
    } catch (err) {
      console.error('Server nicht erreichbar (POST /nicknames)', err);
      this.errorMessage = 'Server nicht erreichbar. Läuft der Chat-API-Server auf Port 3000?';
      alert(this.errorMessage);
    }
  }
}
