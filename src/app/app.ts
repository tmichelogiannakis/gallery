import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Shell } from './core/shell/shell';
import { NavItem } from './shared/types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Shell],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  navItems: NavItem[] = [
    { label: 'Photos', iconName: 'image', path: '/' },
    { label: 'Favorites', iconName: 'favorite', path: '/favorites' }
  ];
}
