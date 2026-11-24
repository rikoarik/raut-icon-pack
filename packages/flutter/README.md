# Rounded Icons — Flutter

Ekstrak `rounded-icons-flutter-0.1.0.tar.gz` ke `vendor/rounded_icons/` pada aplikasi, lalu tambahkan ke `pubspec.yaml`:

```yaml
dependencies:
  rounded_icons:
    path: vendor/rounded_icons
```

Jalankan `flutter pub get`.

```dart
import 'package:rounded_icons/rounded_icons.dart';

const RoundedIcon(RoundedIcons.eventLive, size: 24, label: 'Siaran langsung');
```

`color` mengikuti `IconTheme` jika tidak diisi. Hilangkan `label` jika ikon hanya dekorasi. Paket mencakup 612 aset SVG lokal dan tidak mengunduh ikon saat runtime.
