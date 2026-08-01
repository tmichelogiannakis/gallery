import { Component, input } from '@angular/core';
import { Header } from './header/header';
import { NavItem } from '../shared/types';

@Component({
  selector: 'app-shell',
  imports: [Header],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  navItems = input<NavItem[]>([]);
}
