Feature: View project board

  As a Laboard user & project member
  I should be able to view a project's board

  Background:
    Given user "test" has token "foobar"
    And project "bar" exists in namespace "foo"
    And project "foo/bar" has column "Sandbox"
    And I am not "developer" on project "foo/bar"
    And I go to laboard
    And I login with token "foobar"
    And I click on "foo/bar"

  Scenario: Should not be able to add column
    Then I should not see "Create a new column"

  Scenario: Should not be able to deop a column
    When I open the menu of the "Sandbox" column
    Then I should not see "Drop"

  Scenario: Move column left
    When I open the menu of the "Sandbox" column
    Then I should not see "Left"

  Scenario: Move column right
    When I open the menu of the "Sandbox" column
    Then I should not see "Right"
