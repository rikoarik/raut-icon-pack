export const version = '0.1.0'
export const repository = 'https://github.com/rikoarik/raut-icon-pack'
export const gitUrl = `${repository}.git`
export const releaseTag = `v${version}`
export const releaseUrl = `${repository}/releases/tag/${releaseTag}`
export const mavenUrl = `https://raw.githubusercontent.com/rikoarik/raut-icon-pack/${releaseTag}/maven`
export const files = {
  svg: `rounded-icons-svg-${version}.tgz`,
  react: `rounded-icons-react-${version}.tgz`,
  native: `rounded-icons-react-native-${version}.tgz`,
  flutter: `rounded-icons-flutter-${version}.tgz`,
  android: `rounded-icons-android-${version}.aar`,
  maven: `raut-maven-${version}.zip`,
  apple: `raut-icons-apple-${version}.tgz`,
  cli: `raut-icons-cli-${version}.tgz`,
  styles: `raut-icon-styles-${version}.zip`,
}
export const assetUrl = (file) => `${repository}/releases/download/${releaseTag}/${files[file]}`
export const cliCommand = `npx --yes --package=${assetUrl('cli')} raut-icons`
