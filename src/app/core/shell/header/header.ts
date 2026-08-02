import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../nav-item';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  navItems = input<NavItem[]>([]);
}
