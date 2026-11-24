pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        maven {
            url = uri("$rootDir/raut-maven")
            content { includeGroup("dev.roundedicons") }
        }
        google()
        mavenCentral()
    }
}
rootProject.name = "raut-android-consumer"
