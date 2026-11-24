library;

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

export 'src/icons.g.dart';

/// Paints an icon on its original 24-unit grid at [size] logical pixels.
/// Leave [label] null for a decorative icon beside visible text.
class RoundedIcon extends StatelessWidget {
  const RoundedIcon(this.name, {super.key, this.size = 24, this.color, this.label});

  final String name;
  final double size;
  final Color? color;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final tint = color ?? IconTheme.of(context).color ?? const Color(0xFF171614);
    return SvgPicture.asset(
      'assets/icons/$name.svg',
      package: 'rounded_icons',
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(tint, BlendMode.srcIn),
      semanticsLabel: label,
      excludeFromSemantics: label == null,
    );
  }
}
