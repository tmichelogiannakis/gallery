import { Component, input } from '@angular/core';
import { Header } from './header/header';
import { GlobalLoader } from './global-loader/global-loader';
import { NavItem } from '../../shared/types';

@Component({
  selector: 'app-shell',
  imports: [Header, GlobalLoader],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  navItems = input<NavItem[]>([]);
}
