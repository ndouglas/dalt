# 🍋 Dalt
This is a little webserver for monitoring and controlling devices in my workshop/grow room.

Dalt is a Raspberry Pi 3 B+, named after [House Dalt](https://awoiaf.westeros.org/index.php/House_Dalt), located in a small room off my garage.

Elsewhere I have a bunch of shell scripts to control all of this stuff, but I wanted something that could serve as a continuous monitoring system that I could keep open in the background and that could draw graphs, etc.

I was considering doing this in Python, but thought I might as well do it in NodeJS just to get it working quicker (it's been a few years since I've done even a trivial exercise in Python).

## Current Connections
- Eight individually addressable and controllable 110 VAC outlets
- Two TP-Link Kasa HS103 Wifi mini-outlets
- A DHT11 temperature/humidity sensor

## Planned Upgrades
- Upgrade DHT11 to DHT22
- Probably add more HS103s to control more things
